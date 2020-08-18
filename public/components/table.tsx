/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import { EuiInMemoryTable } from '@elastic/eui';
// @ts-ignore
import { formatDate } from '@elastic/eui/lib/services/format';

export const CohortTable = (data: any) => {
  // eslint-disable-next-line no-console
  const columns = [
    {
      field: 'date',
      name: 'Cohort Date',
      sortable: true,
      render: (date: any) => formatDate(date, 'MM/YYYY'),
    },
    {
      field: 'period',
      name: 'Cohort Period',
      sortable: true,
    },
    {
      field: 'total',
      name: 'Total',
      sortable: true,
      render: (value: any) => value.toFixed(2),
    },
    {
      field: 'value',
      name: 'Value',
      sortable: true,
      render: (value: any) => value.toFixed(2),
    },
    {
      field: 'cumulativeValue',
      name: 'Cumulative Value',
      sortable: true,
    },
  ];

  const sorting: any = {
    sort: {
      field: 'date',
      direction: 'asc',
    },
  };

  return (
    <EuiInMemoryTable
      items={data.data}
      columns={columns}
      sorting={sorting}
      compressed={true}
      pagination={true}
    />
  );
};
