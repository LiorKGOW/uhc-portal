/*
SkeletonRows creates a list of rows object for PatternFly <Table>
containing the Insights Platform <Sekelton> animation, for table loading states.

This is NOT a React component, because it returns an array of rows, so it's not directly renderable.
*/

import React from 'react';

import Skeleton from '@redhat-cloud-services/frontend-components/Skeleton';

function skeletonRows(
  count = 10,
  colSpan = 6,
  size = 'lg',
) {
  const row = {
    cells: [
      {
        props: { colSpan },
        title: <Skeleton size={size} />,
      },
    ],
  };
  const ret = [];
  for (let i = 0; i < count; i += 1) {
    ret.push(row);
  }
  return ret;
}

export default skeletonRows;
