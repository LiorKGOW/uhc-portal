import get from 'lodash/get';
import inRange from 'lodash/inRange';
import cidrTools from 'cidr-tools';
import { Validator, ValidationError } from 'jsonschema';
import { readFile } from './helpers';

// Valid RFC-1035 labels must consist of lower case alphanumeric characters or '-', start with an
// alphabetic character, and end with an alphanumeric character (e.g. 'my-name',  or 'abc-123').
const DNS_LABEL_REGEXP = /^[a-z]([-a-z0-9]*[a-z0-9])?$/;

// Regular expression used to check base DNS domains, based on RFC-1035
const BASE_DOMAIN_REGEXP = /^([a-z]([-a-z0-9]*[a-z0-9])?\.)+[a-z]([-a-z0-9]*[a-z0-9])?$/;

// Regular expression used to check UUID as specified in RFC4122.
const UUID_REGEXP = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Regular expression used to check whether input is a valid IPv4 CIDR range
const CIDR_REGEXP = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[1-9]))$/;
const SERVICE_CIDR_MAX = 24;
const POD_CIDR_MAX = 21;
const POD_NODES_MIN = 32;
const AWS_MACHINE_CIDR_MIN = 16;
const AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 25;
const AWS_MACHINE_CIDR_MAX_MULTI_AZ = 24;
const GCP_MACHINE_CIDR_MAX = 23;

// Regular expression used to check whether input is a valid IPv4 subnet prefix length
const HOST_PREFIX_REGEXP = /^\/?(3[0-2]|[1-2][0-9]|[0-9])$/;
const HOST_PREFIX_MIN = 23;
const HOST_PREFIX_MAX = 26;
const DOCKER_CIDR_RANGE = '172.17.0.0/16';

// Regular expression for a valid URL for a console in a self managed cluster.
const CONSOLE_URL_REGEXP = /^https?:\/\/(([0-9]{1,3}\.){3}[0-9]{1,3}|([a-z0-9-]+\.)+[a-z]{2,})(:[0-9]+)?([a-z0-9_/-]+)?$/i;

// Maximum length for a cluster name
const MAX_CLUSTER_NAME_LENGTH = 50;

// Maximum length of a cluster display name
const MAX_CLUSTER_DISPLAY_NAME_LENGTH = 63;

// Maximum node count
const MAX_NODE_COUNT = 180;

const AWS_ARN_REGEX = /^arn:aws:iam::\d{12}:(user|group)\/\S+/;

const INGRESS_ROUTE_LABEL_MAX_LEN = 63;

const AWS_NUMERIC_ACCOUNT_ID_REGEX = /^\d{12}$/;

// Function to validate that a field is mandatory:
const required = value => (value ? undefined : 'Field is required');

// Function to validate that the identity provider name field doesn't include whitespaces:
const checkIdentityProviderName = (value) => {
  if (!value) {
    return 'Name is required.';
  }
  if (/\s/.test(value)) {
    return 'Name must not contain whitespaces.';
  }
  if (/[^A-Za-z0-9_-]/.test(value)) {
    return 'Name should contain only alphanumeric and dashes';
  }
  return undefined;
};

// Function to validate that the issuer field uses https scheme:
const checkOpenIDIssuer = (value) => {
  if (!value) {
    return 'Issuer URL is required.';
  }
  if (!value.startsWith('https://')) {
    return 'Invalid URL. Issuer must use https scheme without a query string (?) or fragment (#)';
  }
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    return 'Invalid URL';
  }
  if (url.hash !== '' || url.search !== '') {
    return 'The URL must not include a query string (?) or fragment (#)';
  }
  return undefined;
};

// Function to validate that the cluster name field contains a valid DNS label:
const checkClusterName = (value) => {
  if (!value) {
    return 'Cluster name is required.';
  }
  if (!DNS_LABEL_REGEXP.test(value)) {
    return `Cluster name '${value}' isn't valid, must consist of lower-case alphanumeric characters or '-', start with an alphabetic character, and end with an alphanumeric character. For example, 'my-name', or 'abc-123'.`;
  }
  if (value.length > MAX_CLUSTER_NAME_LENGTH) {
    return `Cluster names may not exceed ${MAX_CLUSTER_NAME_LENGTH} characters.`;
  }
  return undefined;
};

// Function to validate that the github team is formatted: <org/team>
const checkGithubTeams = (value) => {
  if (!value) {
    return undefined;
  }
  const teams = value.split(',');

  for (let i = 0; i < teams.length; i += 1) {
    const team = teams[i];
    const orgTeam = team.split('/');

    if (orgTeam.length !== 2) {
      return "Each team must be of format 'org/team'.";
    }

    if (!orgTeam[0] || !orgTeam[1]) {
      return "Each team must be of format 'org/team'.";
    }

    if (/\s/.test(orgTeam[0])) {
      return 'Organization must not contain whitespaces.';
    }

    if (/\s/.test(orgTeam[1])) {
      return 'Team must not contain whitespaces.';
    }
  }

  return undefined;
};

const checkRouteSelectors = (input) => {
  if (!input) {
    return undefined;
  }

  const selectors = input.split(',');


  let error;

  if (selectors.length) {
    if (selectors.some((pair) => {
      const pairParts = pair.split('=');
      // check if prefix exists and get the label
      const value = pairParts[1];
      const keyParts = pairParts[0].split('/');
      const key = keyParts.length > 1 ? keyParts[1] : keyParts[0];

      if (value && value.length > INGRESS_ROUTE_LABEL_MAX_LEN) {
        error = `Length of ingress route label selector value must be less or equal to ${INGRESS_ROUTE_LABEL_MAX_LEN}`;
        return true;
      }

      if (key && key.length > INGRESS_ROUTE_LABEL_MAX_LEN) {
        error = `Length of ingress route label selector key name must be less or equal to ${INGRESS_ROUTE_LABEL_MAX_LEN}`;
        return true;
      }
      if ((!(/^([0-9a-z]+([-_][0-9a-z]+)*)=([0-9a-z]+([-_][0-9a-z]+)*$)/i).test(pair))) {
        error = "A qualified key or value must consist of alphanumeric characters, '-' or '_' and must start and end with an alphanumeric character.";
        return true;
      }

      return false;
    })) {
      return error;
    }
  }

  return undefined;
};

// Function to validate that the cluster ID field is a UUID:
const checkClusterUUID = (value) => {
  if (!value) {
    return 'Cluster ID is required.';
  }
  if (!UUID_REGEXP.test(value)) {
    return `Cluster ID '${value}' is not a valid UUID.`;
  }
  return undefined;
};

// Function to validate the cluster display name length
const checkClusterDisplayName = (value) => {
  if (!value) {
    return undefined;
  }
  if (value.length > MAX_CLUSTER_DISPLAY_NAME_LENGTH) {
    return `Cluster display name may not exceed ${MAX_CLUSTER_DISPLAY_NAME_LENGTH} characters.`;
  }
  return undefined;
};

const checkUser = (value) => {
  if (!value) {
    return 'cannot be empty.';
  }
  if (value.trim() !== value) {
    return 'cannot contain leading and trailing spaces';
  }
  if (value.includes('/')) {
    return 'cannot contain \'/\'.';
  }
  if (value.includes(':')) {
    return 'cannot contain \':\'.';
  }
  if (value.includes('%')) {
    return 'cannot contain \'%\'.';
  }
  if (value === '~') {
    return 'cannot be \'~\'.';
  }
  if (value === '.') {
    return 'cannot be \'.\'.';
  }
  if (value === '..') {
    return 'cannot be \'..\'.';
  }
  return undefined;
};

const checkUserID = (value) => {
  const invalid = checkUser(value);
  return invalid ? `User ID ${invalid}` : undefined;
};

const checkUserName = (value) => {
  const invalid = checkUser(value);
  return invalid ? `Username ${invalid}` : undefined;
};

// Function to validate the cluster console URL
const checkClusterConsoleURL = (value, isRequired) => {
  if (!value) {
    return (isRequired ? 'Cluster console URL should not be empty' : undefined);
  }
  let url;
  try {
    url = new URL(value);
  } catch (error) {
    if (!(value.startsWith('http://') || value.startsWith('https://'))) {
      return 'The URL should include the scheme prefix (http://, https://)';
    }
    return 'Invalid URL';
  }
  if (!CONSOLE_URL_REGEXP.test(value)) {
    if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
      return 'The URL should include the scheme prefix (http://, https://)';
    }
    if (url.hash !== '' || url.search !== '') {
      return 'The URL must not include a query string (?) or fragment (#)';
    }
    return 'Invalid URL';
  }
  return undefined;
};

// Function to validate that a field contains a correct base DNS domain
const checkBaseDNSDomain = (value) => {
  if (!value) {
    return 'Base DNS domain is required.';
  }
  if (!BASE_DOMAIN_REGEXP.test(value)) {
    return `Base DNS domain '${value}' isn't valid, must contain at least two valid lower-case DNS labels separated by dots, for example 'mydomain.com'.`;
  }
  return undefined;
};

// Function to validate IP address blocks
const cidr = (value) => {
  if (value && !CIDR_REGEXP.test(value)) {
    return `IP address range '${value}' isn't valid CIDR notation. It must follow the RFC-4632 format: '192.168.0.0/16'.`;
  }
  return undefined;
};

const getCIDRSubnetLength = (value) => {
  if (!value) {
    return undefined;
  }

  return parseInt(value.split('/').pop(), 10);
};

const awsMachineCidr = (value, formData) => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData.multi_az === 'true';
  const prefixLength = getCIDRSubnetLength(value);

  if (prefixLength < AWS_MACHINE_CIDR_MIN) {
    return `The subnet mask can't be lower than '/${AWS_MACHINE_CIDR_MIN}'.`;
  }

  if (isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_MULTI_AZ) {
    return `The subnet mask can't be higher than '/${AWS_MACHINE_CIDR_MAX_MULTI_AZ}'.`;
  }

  if (!isMultiAz && prefixLength > AWS_MACHINE_CIDR_MAX_SINGLE_AZ) {
    return `The subnet mask can't be higher than '/${AWS_MACHINE_CIDR_MAX_SINGLE_AZ}'.`;
  }

  return undefined;
};

const gcpMachineCidr = (value, formData) => {
  if (!value) {
    return undefined;
  }

  const isMultiAz = formData.multi_az === 'true';
  const prefixLength = getCIDRSubnetLength(value);

  if (isMultiAz && prefixLength > GCP_MACHINE_CIDR_MAX) {
    const maxComputeNodes = 2 ** (28 - GCP_MACHINE_CIDR_MAX);
    const multiAZ = (maxComputeNodes - 9) * 3;
    return `The subnet mask can't be higher than '/${GCP_MACHINE_CIDR_MAX}', which provides up to ${multiAZ} nodes.`;
  }

  if (!isMultiAz && prefixLength > GCP_MACHINE_CIDR_MAX) {
    const maxComputeNodes = 2 ** (28 - GCP_MACHINE_CIDR_MAX);
    const singleAZ = maxComputeNodes - 9;
    return `The subnet mask can't be higher than '/${GCP_MACHINE_CIDR_MAX}', which provides up to ${singleAZ} nodes.`;
  }

  return undefined;
};

const serviceCidr = (value) => {
  if (!value) {
    return undefined;
  }

  const prefixLength = getCIDRSubnetLength(value);

  if (prefixLength > SERVICE_CIDR_MAX) {
    const maxServices = 2 ** (32 - SERVICE_CIDR_MAX) - 2;
    return `The subnet mask can't be higher than '/${SERVICE_CIDR_MAX}', which provides up to ${maxServices} services.`;
  }

  return undefined;
};

const podCidr = (value, formData) => {
  if (!value) {
    return undefined;
  }

  const prefixLength = getCIDRSubnetLength(value);
  if (prefixLength > POD_CIDR_MAX) {
    return `The subnet mask can't be higher than /${POD_CIDR_MAX}.`;
  }

  const hostPrefix = getCIDRSubnetLength(formData.network_host_prefix) || 23;
  const maxPodIPs = 2 ** (32 - hostPrefix);
  const maxPodNodes = Math.floor(2 ** (32 - prefixLength) / maxPodIPs);
  if (maxPodNodes < POD_NODES_MIN) {
    return `The subnet mask of /${prefixLength} does not allow for enough nodes. Try changing the host prefix or the pod subnet range.`;
  }

  return undefined;
};

const validateRange = (value) => {
  if (cidr(value) !== undefined || !value) {
    return undefined;
  }
  const parts = value.split('/');
  const cidrBinaryString = parts[0].split('.').map(octet => Number(octet).toString(2).padEnd(8, '0')).join('');
  const maskBits = parseInt(parts[1], 10);
  const maskedBinaryString = cidrBinaryString.slice(0, maskBits).padEnd(32, '0');

  if (maskedBinaryString !== cidrBinaryString) {
    return 'This is not a subnet address. The subnet prefix is inconsistent with the subnet mask.';
  }
  return undefined;
};

const disjointSubnets = fieldName => (value, formData) => {
  if (!value) {
    return undefined;
  }

  const networkingFields = {
    network_machine_cidr: 'Machine CIDR',
    network_service_cidr: 'Service CIDR',
    network_pod_cidr: 'Pod CIDR',
  };
  delete networkingFields[fieldName];
  const overlappingFields = [];
  try {
    Object.keys(networkingFields).forEach((name) => {
      const fieldValue = get(formData, name, null);
      if (fieldValue && cidrTools.overlap(value, fieldValue)) {
        overlappingFields.push(networkingFields[name]);
      }
    });
  } catch (e) {
    return `Failed to parse CIDR: ${e}`;
  }
  const plural = overlappingFields.length > 1;
  if (overlappingFields.length > 0) {
    return `This subnet overlaps with the subnet${plural ? 's' : ''} in the ${overlappingFields.join(', ')} field${plural ? 's' : ''}.`;
  }
  return undefined;
};

const privateAddress = (value) => {
  if (cidr(value) !== undefined || !value) {
    return undefined;
  }
  const parts = value.split('/');
  const octets = parts[0].split('.').map(octet => (parseInt(octet, 10)));
  const maskBits = parseInt(parts[1], 10);

  // 10.0.0.0/8 – 10.255.255.255
  if (octets[0] === 10 && maskBits >= 8) {
    return undefined;
  }

  // 172.16.0.0/12 – 172.31.255.255
  if (octets[0] === 172 && inRange(octets[1], 16, 32) && maskBits >= 12) {
    return undefined;
  }

  // 192.168.0.0/16 – 192.168.255.255
  if (octets[0] === 192 && octets[1] === 168 && maskBits >= 16) {
    return undefined;
  }

  return 'Range is not private.';
};

const disjointFromDockerRange = (value) => {
  if (!value) {
    return undefined;
  }
  try {
    if (cidrTools.overlap(value, DOCKER_CIDR_RANGE)) {
      return 'Selected range must not overlap with 172.17.0.0/16.';
    }
    return undefined;
  } catch (e) {
    return `Failed to parse CIDR: ${e}`;
  }
};

const awsSubnetMask = fieldName => (value) => {
  if (cidr(value) !== undefined || !value) {
    return undefined;
  }
  const awsSubnetMaskRanges = {
    network_machine_cidr_single_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_SINGLE_AZ],
    network_machine_cidr_multi_az: [AWS_MACHINE_CIDR_MIN, AWS_MACHINE_CIDR_MAX_MULTI_AZ],
    network_service_cidr: [undefined, SERVICE_CIDR_MAX],
  };
  const maskRange = awsSubnetMaskRanges[fieldName];
  const parts = value.split('/');
  const maskBits = parseInt(parts[1], 10);
  if (!maskRange[0]) {
    if (maskBits > maskRange[1] || maskBits < 1) {
      return `Subnet mask must be between /1 and /${maskRange[1]}.`;
    }
    return undefined;
  }
  if (!(maskRange[0] <= maskBits && maskBits <= maskRange[1])) {
    return `Subnet mask must be between /${maskRange[0]} and /${maskRange[1]}.`;
  }
  return undefined;
};

// Function to validate IP address masks
const hostPrefix = (value) => {
  if (!value) {
    return undefined;
  }

  if (!HOST_PREFIX_REGEXP.test(value)) {
    return `The value '${value}' isn't a valid subnet mask. It must follow the RFC-4632 format: '/16'.`;
  }

  const prefixLength = getCIDRSubnetLength(value);

  if (prefixLength < HOST_PREFIX_MIN) {
    const maxPodIPs = 2 ** (32 - HOST_PREFIX_MIN) - 2;
    return `The subnet mask can't be lower than '/${HOST_PREFIX_MIN}', which provides up to ${maxPodIPs} Pod IP addresses.`;
  }
  if (prefixLength > HOST_PREFIX_MAX) {
    const maxPodIPs = 2 ** (32 - HOST_PREFIX_MAX) - 2;
    return `The subnet mask can't be higher than '/${HOST_PREFIX_MAX}', which provides up to ${maxPodIPs} Pod IP addresses.`;
  }

  return undefined;
};

/**
 * Function to validate number of nodes.
 *
 * @param {(string|number)} value - node count to validate.
 * @param {*} min - object ontaining int 'value' of minimum node count,
 * and a string 'validationMsg' with an error message.
 * @param {number} [max=MAX_NODE_COUNT] - maximum allowed number of nodes.
 */
const nodes = (value, min, max = MAX_NODE_COUNT) => {
  if (value === undefined || value < min.value) {
    return (min.validationMsg || `The minimum number of nodes is ${min.value}.`);
  }
  if (value > max) {
    return `Maximum number allowed is ${max}.`;
  }
  // eslint-disable-next-line eqeqeq
  if (Number.isNaN(parseInt(value, 10)) || Math.floor(value) != value) {
    // Using Math.floor to check for valid int because Number.isInteger doesn't work on IE.
    return `'${value}' is not a valid number of nodes.`;
  }
  return undefined;
};

const nodesMultiAz = (value) => {
  if (value % 3 > 0) {
    return 'Number of nodes must be multiple of 3 for Multi AZ cluster.';
  }
  return undefined;
};

/**
 * General function used to validate numeric user input according to some flags.
 * Returns an informative error message when taking an illegal input.
 * @param {*} input           Input string
 * @param {*} allowDecimal    true if input number may have a decimal point,
 *                            false if it must be an integer
 * @param {*} allowNeg        true if input number may be negative, otherwise false
 * @param {*} allowZero       true if input number may be 0, otherwise false
 */
const validateNumericInput = (
  input, {
    allowDecimal = false,
    allowNeg = false,
    allowZero = false,
    max = NaN,
  } = {},
) => {
  if (!input) {
    return undefined; // accept empty input. Further validation done according to field
  }

  const value = Number(input);
  if (Number.isNaN(value)) {
    return 'Input must be a number.';
  }
  if (!allowNeg && !allowZero && value <= 0) {
    return 'Input must be a positive number.';
  }
  if (!allowNeg && allowZero && value < 0) {
    return 'Input must be a non-negative number.';
  }
  if (!allowDecimal && input.toString().includes('.')) {
    return 'Input must be an integer.';
  }
  if (!Number.isNaN(max) && value > max) {
    return `Input cannot be more than ${max}.`;
  }
  return undefined;
};

const checkDisconnectedConsoleURL = value => checkClusterConsoleURL(value, false);

const checkDisconnectedvCPU = value => validateNumericInput(value, { max: 16000 });

const checkDisconnectedSockets = value => validateNumericInput(value, { max: 2000 });

const checkDisconnectedMemCapacity = value => (
  validateNumericInput(value, { allowDecimal: true, max: 256000 })
);

const checkDisconnectedNodeCount = (value) => {
  if (value === '') {
    return undefined;
  }
  if (Number.isNaN(Number(value))) {
    return 'Input must be a number.';
  }
  return nodes(Number(value), { value: 0 }, 250);
};

const validateARN = (value) => {
  if (!value) {
    return 'Field is required';
  }
  if (!AWS_ARN_REGEX.test(value)) {
    return 'ARN value should be in the format arn:aws:iam::123456789012:user/name.';
  }
  return undefined;
};

/**
 * for ReduxFieldArray, validate there is at least one filled value.
 * Note that since ReduxFieldArray stores the input's key/id with each value,
 * and the value itself under a key with the name of the input
 * - this function is not like other validators, it's a function that returns a function,
 * so you can specify the field name.
 *
 * @param {*} values array of value objects, from redux-form
 */
const atLeastOneRequired = fieldName => (fields) => {
  if (!fields) {
    return undefined;
  }
  let nonEmptyValues = 0;
  fields.forEach((field) => {
    const content = get(field, fieldName, null);
    if (content && content.trim() !== '') {
      nonEmptyValues += 1;
    }
  });
  if (nonEmptyValues === 0) {
    return 'At least one is required.';
  }
  return undefined;
};

const awsNumericAccountID = (input) => {
  if (!input) {
    return 'AWS account ID is required.';
  }
  if (!AWS_NUMERIC_ACCOUNT_ID_REGEX.test(input)) {
    return 'AWS account ID must be a 12 digits positive number.';
  }
  return undefined;
};

const validateServiceAccountObject = (obj) => {
  const osdServiceAccountSchema = {
    id: '/osdServiceAccount',
    type: 'object',
    properties: {
      type: {
        const: 'service_account',
      },
      project_id: {
        type: 'string',
      },
      private_key_id: {
        type: 'string',
      },
      private_key: {
        type: 'string',
        pattern: '^-----BEGIN PRIVATE KEY-----\n(.|\n)*\n-----END PRIVATE KEY-----\n$',
      },
      client_email: {
        type: 'string',
        format: 'email',
      },
      client_id: { // maybe numeric?
        type: 'string',
      },
      auth_uri: {
        const: 'https://accounts.google.com/o/oauth2/auth',
      },
      token_uri: {
        type: 'string',
        format: 'uri',
      },
      auth_provider_x509_cert_url: {
        const: 'https://www.googleapis.com/oauth2/v1/certs',
      },
      client_x509_cert_url: {
        type: 'string',
        format: 'uri',
      },
    },
    required: [
      'type',
      'project_id',
      'private_key_id',
      'private_key',
      'client_email',
      'client_id',
      'auth_uri',
      'token_uri',
      'auth_provider_x509_cert_url',
      'client_x509_cert_url',
    ],
  };
  const v = new Validator();
  v.validate(obj, osdServiceAccountSchema, { throwError: true });
  return undefined;
};

const validateGCPServiceAccount = async (fileList) => {
  if (!fileList) {
    return undefined;
  }
  const file = fileList[0];

  try {
    const fileContent = await readFile(file);
    const contentObj = JSON.parse(fileContent);
    return validateServiceAccountObject(contentObj);
  } catch (e) {
    if (e instanceof SyntaxError) {
      // eslint-disable-next-line no-throw-literal
      throw { gcp_service_account: 'Invalid JSON format.' };
    }
    if (e instanceof ValidationError) {
      let errorMessage;
      if (e.property.startsWith('instance.')) {
        const errorFieldName = e.property.replace('instance.', '');
        if (e.message.indexOf('does not match pattern') !== -1) {
          errorMessage = `The field '${errorFieldName}' is not in the required format`;
        } else {
          errorMessage = `The field '${errorFieldName}' ${e.message}`;
        }
      } else {
        errorMessage = e.message;
      }
      // eslint-disable-next-line no-throw-literal
      throw { gcp_service_account: `The provided JSON does not meet the requirements: ${errorMessage}` };
    }
    // eslint-disable-next-line no-throw-literal
    throw { gcp_service_account: 'Error reading file.' };
  }
};

const validators = {
  required,
  checkIdentityProviderName,
  checkClusterName,
  checkClusterUUID,
  checkClusterDisplayName,
  checkUserID,
  checkUserName,
  checkBaseDNSDomain,
  cidr,
  awsMachineCidr,
  gcpMachineCidr,
  serviceCidr,
  podCidr,
  disjointSubnets,
  validateRange,
  privateAddress,
  awsSubnetMask,
  disjointFromDockerRange,
  hostPrefix,
  nodes,
  nodesMultiAz,
  validateNumericInput,
  checkOpenIDIssuer,
  checkGithubTeams,
  checkRouteSelectors,
  checkDisconnectedConsoleURL,
  checkDisconnectedvCPU,
  checkDisconnectedSockets,
  checkDisconnectedMemCapacity,
  checkDisconnectedNodeCount,
  AWS_MACHINE_CIDR_MIN,
  AWS_MACHINE_CIDR_MAX_SINGLE_AZ,
  AWS_MACHINE_CIDR_MAX_MULTI_AZ,
  GCP_MACHINE_CIDR_MAX,
  SERVICE_CIDR_MAX,
  POD_NODES_MIN,
  HOST_PREFIX_MIN,
  HOST_PREFIX_MAX,
};

export {
  required,
  atLeastOneRequired,
  checkClusterUUID,
  checkIdentityProviderName,
  checkClusterDisplayName,
  checkUserID,
  checkUserName,
  checkClusterConsoleURL,
  checkOpenIDIssuer,
  checkGithubTeams,
  checkRouteSelectors,
  checkDisconnectedConsoleURL,
  checkDisconnectedvCPU,
  checkDisconnectedSockets,
  checkDisconnectedMemCapacity,
  checkDisconnectedNodeCount,
  validateARN,
  awsNumericAccountID,
  validateGCPServiceAccount,
  validateServiceAccountObject,
};

export default validators;
