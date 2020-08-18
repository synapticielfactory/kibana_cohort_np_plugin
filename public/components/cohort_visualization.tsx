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
import {
  getDateHistogram,
  getFormatTypes,
  getValueFunction,
  processData,
  showGraph,
  showTable,
  // @ts-ignore
} from '../utils';
import { VisParams, ExprVis } from '../../../../src/plugins/visualizations/public';

export const createCohortVisualization = () => {
  return class CohortBaseVisualization {
    containerClassName = 'cohort-container';
    margin = { top: 20, right: 20, bottom: 40, left: 50 };
    vis: ExprVis | undefined = undefined;
    el: HTMLElement | undefined = undefined;

    constructor(el: HTMLElement, vis: ExprVis) {
      this.el = el;
      this.vis = vis;
      // @ts-ignore
      this.container = document.createElement('div');
      // @ts-ignore
      this.container.className = this.containerClassName;
      // @ts-ignore
      this.el.appendChild(this.container);
    }

    // Rendering
    async render(visData: object, visParams: VisParams) {
      // @ts-ignore
      if (!this.container) return;
      // @ts-ignore
      this.container.innerHTML = '';

      if (
        // @ts-ignore
        !(Array.isArray(visData.rows) && visData.rows.length) ||
        // @ts-ignore
        this.el.clientWidth === 0 ||
        // @ts-ignore
        this.el.clientHeight === 0
      ) {
        return;
      }

      const dateHistogram = getDateHistogram(visData);
      const formatTimeFn = getFormatTypes(dateHistogram);
      const data = processData(visData, dateHistogram);
      const valueFn = getValueFunction(visParams);

      // @ts-ignore
      const width = this.el.offsetWidth - this.margin.left - this.margin.right;
      // @ts-ignore
      const height = this.el.offsetHeight - this.margin.top - this.margin.bottom;
      // @ts-ignore
      const allWidth = this.el.offsetWidth;
      // @ts-ignore
      const allHeight = this.el.offsetHeight;
      const measures = { width, height, margin: this.margin, allWidth, allHeight };

      const { pivottable, table, sample_table, percentual, mapColors } = visParams;

      // eslint-disable-next-line @typescript-eslint/camelcase
      if (table && !sample_table) {
        // @ts-ignore
        showTable(mapColors, dateHistogram, this.container, data, valueFn, formatTimeFn);
      }
      // eslint-disable-next-line @typescript-eslint/camelcase
      if (!table && !sample_table && !pivottable) {
        // @ts-ignore
        showGraph(percentual, this.container, measures, data, valueFn, formatTimeFn);
      }
    }

    destroy() {
      if (this.el !== undefined) {
        // @ts-ignore
        this.container.parentNode.removeChild(this.container);
        // @ts-ignore
        this.container = null;
      }
    }
  };
};
