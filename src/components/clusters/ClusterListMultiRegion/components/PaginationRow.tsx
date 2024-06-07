import React from 'react';

import { Pagination } from '@patternfly/react-core';

type Props = {
  currentPage: number;
  pageSize: number;
  itemCount: number;
  itemsStart: number;
  itemsEnd: number;
  onPerPageSelect: () => void;
  variant: 'top' | 'bottom';
  isDisabled: boolean;
  onPageChange: (_event: any, page: number) => void;
};

export const PaginationRow = ({
  currentPage,
  pageSize,
  itemCount,
  itemsStart,
  itemsEnd,
  onPageChange,
  onPerPageSelect,
  variant,
  isDisabled,
}: Props) => (
  <Pagination
    page={currentPage}
    perPage={pageSize}
    itemCount={itemCount}
    itemsStart={itemsStart}
    itemsEnd={itemsEnd}
    onPreviousClick={onPageChange}
    onNextClick={onPageChange}
    onPerPageSelect={onPerPageSelect}
    onPageInput={onPageChange}
    variant={variant}
    dropDirection={variant === 'bottom' ? 'up' : 'down'}
    isCompact={variant !== 'bottom'}
    isDisabled={isDisabled}
    onFirstClick={onPageChange}
    onLastClick={onPageChange}
    onSetPage={onPageChange}
  />
);
