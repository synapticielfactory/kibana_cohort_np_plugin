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
} from '../utils';

export function CohortVisualizationProvider() {
  return class CohortBaseVisualizations {
    containerClassName = 'cohort-container';
    margin = { top: 20, right: 20, bottom: 40, left: 50 };

    constructor(el, vis) {
      console.log(vis);
      this.el = el;
      this.vis = vis;
      this.container = document.createElement('div');
      this.container.className = this.containerClassName;
      this.el.appendChild(this.container);
    }
    async render(visData, visParams) {
      console.log(visData);
      console.log(visParams);
      if (!this.container) return;
      this.container.innerHTML = '';

      if (
        !(Array.isArray(visData.tables) && visData.tables.length) ||
        this.el.clientWidth === 0 ||
        this.el.clientHeight === 0
      ) {
        return;
      }

      const dateHistogram = getDateHistogram(this.vis);
      const formatTimeFn = getFormatTypes(dateHistogram);
      const data = processData(visData, dateHistogram);
      const valueFn = getValueFunction(this.vis.params);

      const width = this.el.offsetWidth - this.margin.left - this.margin.right;
      const height = this.el.offsetHeight - this.margin.top - this.margin.bottom;
      const allWidth = this.el.offsetWidth;
      const allHeight = this.el.offsetHeight;
      const measures = { width, height, margin: this.margin, allWidth, allHeight };

      if (this.vis.params.table) {
        showTable(
          this.vis.params.mapColors,
          dateHistogram,
          this.container,
          data,
          valueFn,
          formatTimeFn
        );
      } else {
        showGraph(
          this.vis.params.percentual,
          this.container,
          measures,
          data,
          valueFn,
          formatTimeFn
        );
      }
    }

    destroy() {
      // eslint-disable-next-line no-console
      console.log('destroying');
      if (this.el !== undefined) {
        this.container.parentNode.removeChild(this.container);
        this.container = null;
      }
    }
  };
}
