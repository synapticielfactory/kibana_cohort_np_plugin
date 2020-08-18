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

// Refactor some docs from https://www.elastic.co/fr/blog/developing-new-kibana-visualizations

import { DataPublicPluginSetup } from '../../../src/plugins/data/public';
import { ExprVis, VisParams } from '../../../src/plugins/visualizations/public';
// import { CohortVisComponent } from './components/cohort_vis_controller';
import { CohortVisualizationProvider } from './components/cohort_visualization';
import { CohortOptionsParams } from './cohort_vis_options';
import { Schemas } from '../../../src/plugins/vis_default_editor/public';
import { AggGroupNames } from '../../../src/plugins/data/public';
import './cohort.scss';

export interface CohortVisComponentProp {
  renderComplete: () => {};
  vis: ExprVis;
  data: DataPublicPluginSetup;
  visParams: VisParams;
}

export function getCohortVisDefinition() {
  return {
    name: 'cohort',
    title: 'Cohort',
    icon: 'wrench',
    description: 'Cohort Analysis Visualization',
    visConfig: {
      defaults: {
        percentual: true, // Show percentual values
        inverse: false, // Show inverse values
        cumulative: false, // Show cumulative values
        table: true, // Show values as table
        mapColors: 'heatmap', // Show heatmap colors
        pivottable: false, // Use react-pivottable
        sample_table: false, // Use Eui Sample Table
      },
      // Main component controller to render the Viz
      // React Visualization Type
      // component: CohortVisComponent,
    },
    // Base Visualization Type
    visualization: CohortVisualizationProvider,
    editorConfig: {
      optionsTemplate: CohortOptionsParams,
      enableAutoApply: true,
      // Data Schema for Metrics & Buckets
      schemas: new Schemas([
        {
          group: AggGroupNames.Metrics,
          name: 'metric',
          title: 'Metrics',
          max: 1, // Remove this if you require more metrics
          min: 1,
          aggFilter: ['count', 'sum', 'avg', 'cardinality'],
          defaults: [{ type: 'cardinality', schema: 'metric' }],
        },
        {
          group: AggGroupNames.Buckets,
          name: 'cohort_date',
          title: 'Cohort Date',
          min: 1,
          max: 1,
          aggFilter: ['date_histogram', 'terms'],
          defaults: [
            {
              type: 'date_histogram',
              schema: 'cohort_date',
              params: {
                interval: 'M',
                orderBy: '_term',
              },
            },
          ],
        },
        {
          group: AggGroupNames.Buckets,
          name: 'cohort_period',
          title: 'Cohort Period',
          min: 0,
          max: 1,
          aggFilter: ['histogram'],
          defaults: [
            {
              type: 'histogram',
              schema: 'cohort_period',
              params: {
                interval: 30,
              },
            },
          ],
        },
      ]),
    },
    stage: 'experimental',
    requestHandler: 'courier',
    hierarchicalData: true,
    responseHandler: 'none',
  };
}
