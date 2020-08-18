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
/* eslint-disable constructor-super */
import React from 'react';
// https://github.com/plotly/react-pivottable
// @ts-ignore
import PivotTableUI from 'react-pivottable/PivotTableUI';
// @ts-ignore
import { formatDate } from '@elastic/eui/lib/services/format';
import { CohortVisParams } from '../types';
// @ts-ignore
// @ts-ignore
import {
  getFormatTypes,
  getValueFunction,
  processData,
  showTable,
  getDateHistogram,
  showGraph,
  // @ts-ignore
} from '../utils';
// @ts-ignore
import { CohortTable } from './table';
// import 'react-pivottable/pivottable.css';
// import '../cohort.scss';
import 'react-pivottable/pivottable.css';
// eslint-disable-next-line import/order
import { EuiPanel } from '@elastic/eui';

interface CohortVisComponentProps extends CohortVisParams {
  renderComplete: () => {};
}

/**
 * The CohortVisComponent renders the form.
 */
export class CohortVisComponent extends React.Component<CohortVisComponentProps> {
  containerClassName = 'cohort-container';
  margin = { top: 20, right: 20, bottom: 40, left: 50 };
  private el: HTMLElement;
  private element: HTMLElement;

  /**
   * Will be called after the first render when the component is present in the DOM.
   *
   * We call renderComplete here, to signal, that we are done with rendering.
   */
  componentDidMount() {
    this.props.renderComplete();
  }

  /**
   * Will be called after the component has been updated and the changes has been
   * flushed into the DOM.
   *
   * We will use this to signal that we are done rendering by calling the
   * renderComplete property.
   */
  componentDidUpdate() {
    this.props.renderComplete();
  }

  constructor(props: CohortVisComponentProps) {
    super(props);
    // eslint-disable-next-line no-console
    console.log(props);
    //console.log(el);
    const DivStyle = {
      borderTop: '2px solid blue',
      width: '100%',
      hight: '100%',
      backgroundColor: 'red',
    };
    // @ts-ignore
    this.element = document.getElementsByClassName('visualization');
    this.el = document.createElement('div');

    // @ts-ignore
    this.container = document.createElement('div');
    // @ts-ignore
    this.container.className = this.containerClassName;
    // @ts-ignore
    this.el.appendChild(this.container);
  }

  /**
   * Render the actual HTML.
   */
  render() {
    // @ts-ignore
    if (!this.container) return;
    // @ts-ignore
    this.container.innerHTML = '';
    //console.log('HTMLElement -> ', this.el);
    const { vis, visData, visParams, config, renderComplete }: any = this.props;
    const { pivottable, table, sample_table, percentual, mapColors }: any = visParams;
    // @ts-ignore
    const dateHistogram = getDateHistogram(this.props.visData);
    const formatTimeFn = getFormatTypes(dateHistogram);
    // @ts-ignore
    let data = processData(this.props.visData, dateHistogram);
    // @ts-ignore
    const valueFn = getValueFunction(this.props.visParams);
    const width = this.el.offsetWidth - this.margin.left - this.margin.right;
    const height = this.el.offsetHeight - this.margin.top - this.margin.bottom;
    const allWidth = this.el.offsetWidth;
    const allHeight = this.el.offsetHeight;
    const measures = { width: 1200, height: 1000, margin: this.margin, allWidth: 1200, allHeight: 1200 };
    console.log(measures);

    // @ts-ignore
    if (table) {
      showTable(
        // @ts-ignore
        mapColors,
        dateHistogram,
        // @ts-ignore
        this.container,
        data,
        valueFn,
        formatTimeFn
      );
      // eslint-disable-next-line no-empty
    } else {
      showGraph(
        // @ts-ignore
        percentual,
        // @ts-ignore
        this.container,
        measures,
        data,
        valueFn,
        formatTimeFn
      );
    }
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/camelcase
    if (sample_table) {
      return (
        <EuiPanel paddingSize="m">
          <CohortTable data={data} />
        </EuiPanel>
      );
    }
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/camelcase
    if (pivottable && !sample_table) {
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/camelcase
      const cohort_date_schema = this.props.visParams.dimensions.cohort_date[0].format.params
        .pattern;

      data = data.map((item: any) => ({
        'Cohort Date': dateHistogram ? formatDate(item.date, cohort_date_schema) : item.date,
        'Cohort Period': item.period,
        Total: item.value,
        Value: item.total,
        'Cumulative Value': item.cumulativeValue,
      }));
      return <PivotTableUI data={data} onChange={(s: any) => this.setState(s)} {...this.state} />;
    } else {
      // @ts-ignore
      // eslint-disable-next-line react/no-danger
      return <div dangerouslySetInnerHTML={{ __html: this.container.innerHTML }} />;
    }
  }
}
