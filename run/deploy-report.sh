#!/bin/bash -e
shopt -s nocasematch

# An array to store the jiraKeys in a commit
jiraKeys=()
# An array of master commits whose message strings where found in live_candidate log file
found=()
# master commits whose message strings where NOT found in live_candidate log file
# ...and whose associated jira tickets were not all closed; most likely still in 'Review'
notClosed=()
notClosedDueToDependencies=()
# master commits ready to promote to live_candidate
readyToPromote=()
readyToPromoteSHAs=()

releaseNotes=()

jira_token="${1#--jira-token=}"

# Read each line from stdin (piped CSV data) and convert it to JSON
while IFS=',' read -r commitHash commitDate commitMessage; do
  echo "------------------------------------------------"
  echo "|           live_consoledev_master             |"
  echo "|  commitHash  |  commitDate  |  commitMessage |"
  echo "------------------------------------------------"
  masterLogLine="$commitHash $commitDate $commitMessage"
  echo "$masterLogLine"

  if [[ $(grep -cF "$commitMessage" "./candidateBranch.txt") -gt 0 ]]; then
    echo "--> FOUND string \"$commitMessage\" in live_candidate"
    found+=("$masterLogLine")
    continue
  else
    echo "DID NOT FIND string \"$commitMessage\" in live_candidate"

    commitDescription=$(git log --format=%b -n 1 $commitHash)
    commitDescription="${commitDescription//\"/\\\"}"
    echo -e "commitDescription=$commitDescription"

    # Pattern to match a assisted installer version bump/update MR
    assistedInstallerRegex="^([Bb][Uu][Mm][Pp]|[Uu][Pp][Dd][Aa][Tt][Ee]).*openshift-assisted"
    if [[ $commitDescription =~ $assistedInstallerRegex ]]; then
      echo "Skipping Assisted Installer version bump/update."
      continue  # goto next MR
    fi

    mrID=$(echo "$commitDescription" | grep -o '![0-9]\{4\}' | tr -d '!')
    mrDesc=$(echo "$commitDescription" | awk 'NR==1 { print }')
    # Pattern matching to extract jiraKeys
    jiraTicketRegex="(HAC|MGMT|OCM|SDA|SDB|RHBKAAS)[- ]?([0-9]+)"
    # Find and store all matching jiraKeys
    startIndex=0
    while [[ ${commitDescription:startIndex} =~ $jiraTicketRegex ]]; do
      matched="${BASH_REMATCH[1]}-${BASH_REMATCH[2]}"
      # Check if the substring already exists in the array
      if [[ ! " ${jiraKeys[*]} " =~ " ${matched} " ]]; then
        jiraKeys+=("$matched")
      fi
      # update start index for the next match
      startIndex=$((startIndex + ${#BASH_REMATCH[0]}))
    done

    # Check if jiraKeys array is empty
    jiraKeysAsString=""
    if [ "${#jiraKeys[@]}" -eq 0 ]; then
      readyToPromote+=("  $masterLogLine\\n                       $mrDesc")
      readyToPromoteSHAs+=("$commitHash")
      jiraKeysAsString="-"
      releaseNote="$(jq --null-input --compact-output --arg revision "$commitHash" --arg ticket "$jiraKeysAsString" --arg description "$mrDesc" --arg mr "!$mrID" '$ARGS.named')"
      releaseNotes+=("$releaseNote")
    else
      allJirasClosed=true
      allDependentJirasClosed=true
      # Iterate over the jiraKeys and look them up
      for jiraKey in "${jiraKeys[@]}"; do
        if [ -n "$jiraKeysAsString" ]; then
          jiraKeysAsString+=", $jiraKey"
        else
          jiraKeysAsString="$jiraKey"
        fi
        echo "  JIRA info"
        printf "    key: %s\n" "$jiraKey"

        response=$(curl -s -X GET -H "Authorization: Bearer $jira_token" -H "Content-Type: application/json" "https://issues.redhat.com/rest/api/2/issue/$jiraKey?fields=key,summary,resolutiondate,status,issuelinks")

        # Check if the response contains an error
        if [[ $(echo "$response" | jq -r '.errorMessages') != "null" ]]; then
          # Error response
          errorMessages=$(echo "$response" | jq -r '.errorMessages | join(", ")')
          echo "Error: $errorMessages"
          exit 1  # Exit the script with an error status
        fi

        summary=$(echo "$response" | jq -r '.fields.summary')
        printf "    summary: %s\n" "$summary"

        status=$(echo "$response" | jq -r '.fields.status.name')
        printf "    status: %s\n" "$status"

        resolutiondate=$(echo "$response" | jq -r '.fields.resolutiondate')
        printf "    resolutiondate: %s\n" "$resolutiondate"

        if [[ "$status" != "Closed" && "$status" != "Verified" ]]; then
          allJirasClosed=false
        else
          # if closed, look up 'depends on' jira tickets and make sure they are also closed
          issuelinks=$(echo "$response" | jq -r '.fields.issuelinks')
          dependentIssueLinks=$(echo "$issuelinks" | jq '[.[] | select(.type.name == "Depend" and .outwardIssue != null and (.outwardIssue.key | test("(HAC|MGMT|OCM|SDA|SDB|RHBKAAS)[- ]?([0-9]+)")))]')
          if [ "$(echo "$dependentIssueLinks" | jq '. | length')" -gt 0 ]; then
            echo "    is dependent on:"
            for row in $(echo "${dependentIssueLinks}" | jq -r '.[] | @base64'); do
              _jq() {
                  echo ${row} | base64 --decode | jq -r ${1}
              }
              dependentStatus=$(_jq '.outwardIssue.fields.status.name')
              echo "        key: "$(_jq '.outwardIssue.key')
              echo "          summary: "$(_jq '.outwardIssue.fields.summary')
              echo "          status: "$dependentStatus
              if [[ "$dependentStatus" != "Closed" && "$dependentStatus" != "Verified" ]]; then
                allDependentJirasClosed=false
              fi
            done
          fi
        fi
      done # Iterating over the jiraKeys

      if [[ "$allJirasClosed" == true && "$allDependentJirasClosed" == true ]]; then
        readyToPromote+=("C $masterLogLine\\n                       $mrDesc")
        readyToPromoteSHAs+=("$commitHash")
        releaseNote="$(jq --null-input --compact-output --arg revision "$commitHash" --arg ticket "$jiraKeysAsString" --arg description "$mrDesc" --arg mr "!$mrID" '$ARGS.named')"
        releaseNotes+=("$releaseNote")
      elif [[ "$status" != "Closed" && "$status" != "Verified" ]]; then
        notClosed+=("$masterLogLine")
      else
        notClosedDueToDependencies+=("$masterLogLine")
      fi
    fi 
    jiraKeys=()
  fi
done
echo " "
echo "--------------------------------------------------------------------------"
echo " "
echo "Commits ready to promote to candidate"
echo "  master commit messages not found in candidate"
echo "  where 'C' = ...and all associated jira tickets of the commit are Closed"
echo " "
for logLine in "${readyToPromote[@]}"; do
  echo -e "$logLine"
done

# To create MR
echo " "
echo "To create a release candidate branch, execute these commands:"
echo " "

# Create a new array to store the reversed elements
reversedReadyToPromoteSHAs=()

# Iterate over the commitSHA array in reverse
for ((i=${#readyToPromoteSHAs[@]}-1; i>=0; i--)); do
    reversedReadyToPromoteSHAs+=("${readyToPromoteSHAs[i]}")
done

# Create a temporary branch with the desired commits
tempBranch="candidate-$(date +"%B-%d-%Y")"
echo "git checkout -b $tempBranch live_candidate"
echo " "
echo "git cherry-pick -x -m 1 ${reversedReadyToPromoteSHAs[@]}"
echo " "

# Release Notes
formattedDate="$(date +"%B %d %Y")"
echo "Release Notes (copy & paste into gitlab wiki page)"
echo " "
echo "### $formattedDate"
echo " "
echo "> _status: draft_"
echo " "
echo "| revision | ticket | description | MR |"
echo "| --- | --- | --- | --- | "
for releaseNote in "${releaseNotes[@]}"; do
  revision=$(echo "$releaseNote" | jq -r '.revision')
  ticket=$(echo "$releaseNote" | jq -r '.ticket')
  description=$(echo "$releaseNote" | jq -r '.description')
  mr=$(echo "$releaseNote" | jq -r '.mr')
  echo "| $revision | $ticket | $description | $mr |"
done
echo " "
echo "------- Other Information -------"
echo " "
echo "Master commit messages not found in candidate, but not all associated jira tickets are Closed"
echo " "
for logLine in "${notClosed[@]}"; do
  echo "$logLine"
done

echo " "
echo "Master commit messages not found in candidate, but not all jira tickets it depends on are Closed"
echo " "
for logLine in "${notClosedDueToDependencies[@]}"; do
  echo "$logLine"
done

echo " "
echo "Master commit messages found in candidate"
echo " "
for logLine in "${found[@]}"; do
  echo "$logLine"
done
shopt -u nocasematch
