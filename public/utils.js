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

import d3 from 'd3';

const tableClassName = 'cohort-table';
const lineClassName = 'cohort-line';

const tooltipClassName = 'tooltip';
const cohortDateClassName = 'cohortDate';
const legendClassName = 'legend';
const axisXClassName = 'axis axis--x';
const axisYClassName = 'axis axis--y';

const red = '#ff4e61';
const yellow = '#ffef7d';
const green = '#32c77c';
const colors = [red, yellow, green];

const formatTypes = {
  undefined: (d) => d,
  custom: d3.time.format('%Y/%m/%d %H:%M:%S'),
  auto: d3.time.format('%Y/%m/%d %H:%M:%S'),
  ms: d3.time.format('%Y/%m/%d %H:%M:%S,%L'),
  s: d3.time.format('%Y/%m/%d %H:%M:%S'),
  m: d3.time.format('%Y/%m/%d %H:%M'),
  h: d3.time.format('%Y/%m/%d %H:%M'),
  d: d3.time.format('%Y/%m/%d'),
  w: d3.time.format('%Y/%m/%d'),
  M: d3.time.format('%Y/%m'),
  y: d3.time.format('%Y'),
};

/**
 * @param {number} v
 * @returns {number}
 */
export const round = (v) => Math.round(v * 100) / 100;
/**
 * @param {object} d
 * @returns {number}
 */
export const cumulativeFn = (d) => d.cumulativeValue;
/**
 * @param {object} d
 * @returns {number}
 */
export const absoluteFn = (d) => d.value;
/**
 * @param {string} dateHistogram
 * @returns {function}
 */
export const getFormatTypes = (dateHistogram) => formatTypes[dateHistogram];

/**
 * @param {string} mapColors
 * @param {string} dateHistogram
 * @param {HTMLElement} element
 * @param {array} data
 * @param {function} valueFn
 * @param {function} formatTime
 */
export function showTable(mapColors, dateHistogram, element, data, valueFn, formatTime) {
  const minMaxesForColumn = [];
  const periodMeans = d3
    .nest()
    .key((d) => d.period)
    .entries(data)
    .map((d) => {
      const minMax = d3.extent(d.values, valueFn);
      const mean = round(d3.mean(d.values, valueFn));
      const minMaxObj = {
        min: minMax[0],
        max: minMax[1],
        mean,
      };
      minMaxesForColumn.push(minMaxObj);
      return mean;
    });

  const customColumn = dateHistogram ? 'Date' : 'Term';
  const fixedColumns = ['Total', customColumn];
  const columns = d3
    .map(data, (d) => d.period)
    .keys()
    .map((x) => parseInt(x, 10));
  const allColumns = fixedColumns.concat(columns);

  const table = d3.select(element).append('table').attr('class', tableClassName);

  const thead = table.append('thead');
  const tbody = table.append('tbody');
  const tfoot = table.append('tfoot');

  thead
    .append('tr')
    .selectAll('th')
    .data(allColumns)
    .enter()
    .append('th')
    .text((column) => column);

  const groupedData = d3
    .nest()
    .key((d) => formatTime(d.date))
    .entries(data);
  const rows = tbody.selectAll('tr').data(groupedData).enter().append('tr');

  const colorScale = getColorScale(mapColors, data, valueFn);

  rows
    .selectAll('td')
    .data((row) => {
      const date = row.key;
      let total = 0;
      const vals = columns.map((period) => {
        const d = row.values.find((d) => period === d.period);
        if (d) {
          total = round(d.total);
          return valueFn(d);
        }
      });

      return [total, date].concat(vals);
    })
    .enter()
    .append('td')
    .style('background-color', (d, i) => {
      if (i >= 2) {
        // skip first and second columns
        return colorScale(d, minMaxesForColumn[i - 2]);
      }
    })
    .text((d) => d);

  const meanOfMeans = round(d3.mean(periodMeans, (meanObj) => meanObj));
  const meanOfMeansTittle = `Mean (${meanOfMeans})`;
  const allMeans = ['-', meanOfMeansTittle].concat(periodMeans);

  tfoot
    .append('tr')
    .selectAll('td')
    .data(allMeans)
    .enter()
    .append('td')
    .text((d) => d);
}

/**
 *
 * @param {boolean} percentual
 * @param {HTMLElement} element
 * @param {object} measures
 * @param {array} data
 * @param {function} valueFn
 * @param {function} formatTime
 */
export function showGraph(percentual, element, measures, data, valueFn, formatTime) {
  // append the svg object to the HTMLElement
  const svg = d3
    .select(element)
    .append('svg')
    .attr('width', measures.allWidth)
    .attr('height', measures.allHeight);

  const g = svg
    .append('g')
    .attr('transform', `translate(${measures.margin.left}, ${measures.margin.top})`);

  const x = d3.scale.linear().range([0, measures.width]);
  const y = d3.scale.linear().range([measures.height, 0]);
  const z = d3.scale.category20();

  const line = d3.svg
    .line()
    .x((d) => x(d.period))
    .y((d) => y(valueFn(d)));

  const xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(10);
  const yAxis = d3.svg.axis().scale(y).orient('left').ticks(10);

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', tooltipClassName)
    .style('opacity', 0);

  x.domain(d3.extent(data, (d) => d.period));
  y.domain([0, d3.max(data, valueFn)]);

  const dataNest = d3
    .nest()
    .key((d) => formatTime(d.date))
    .entries(data);

  z.domain(dataNest.map((d) => d.key));

  g.selectAll('dot_x')
    .data(data)
    .enter()
    .append('circle')
    .attr('r', 3) // Size of the circle
    .attr('cx', (d) => x(d.period))
    .attr('cy', (d) => y(valueFn(d)))
    .style('fill', (d) => z(formatTime(d.date)))
    .style('opacity', 1)
    .on('mouseover', (d) => {
      tooltip.transition().duration(100).style('opacity', 0.9);

      tooltip
        .html(`${formatTime(d.date)} ( ${d.period} )<br/>${round(valueFn(d))}`)
        .style('background', z(formatTime(d.date)))
        .style('left', `${d3.event.pageX + 5}px`)
        .style('top', `${d3.event.pageY - 35}px`);
    })
    .on('mouseout', () => {
      tooltip.transition().duration(500).style('opacity', 0);
    });

  g.append('g')
    .attr('class', axisXClassName)
    .attr('transform', `translate(0, ${measures.height})`)
    .call(xAxis);

  g.append('g')
    .attr('class', axisYClassName)
    .call(yAxis)
    .append('text')
    .attr('y', 10)
    .attr('x', 10)
    .attr('dy', '0.3em')
    .style('font', '10px sans-serif')
    .style('text-anchor', 'start')
    .text(percentual ? '%' : 'Total');

  const cohortDate = g
    .selectAll(`.${cohortDateClassName}`)
    .data(dataNest)
    .enter()
    .append('g')
    .attr('class', cohortDateClassName);

  cohortDate
    .append('path')
    .attr('class', lineClassName)
    .attr('d', (d) => line(d.values))
    .style('stroke', (d) => z(d.key));

  const legend = g
    .append('g')
    .attr('class', legendClassName)
    .attr('x', 10)
    .attr('y', 35)
    .attr('height', 100)
    .attr('width', 100);

  legend
    .selectAll('rect')
    .data(dataNest)
    .enter()
    .append('rect')
    .attr('x', 10)
    .attr('y', (d, i) => i * 20 + 20)
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', (d) => z(d.key));

  legend
    .selectAll('text')
    .data(dataNest)
    .enter()
    .append('text')
    .attr('x', 30)
    .attr('y', (d, i) => i * 20 + 28)
    .style('font', '10px sans-serif')
    .text((d) => d.key);
}

/**
 *
 * @param {boolean} cumulative
 * @param {boolean} percentual
 * @param {boolean} inverse
 * @returns {function}
 */
export function getValueFunction({ cumulative, percentual, inverse }) {
  const valueFn = cumulative ? cumulativeFn : absoluteFn;
  const percentFn = (d) => round((valueFn(d) / d.total) * 100);
  const inverseFn = (d) => round(100 - (valueFn(d) / d.total) * 100);

  if (percentual) {
    if (inverse) {
      return inverseFn;
    } else {
      return percentFn;
    }
  }

  return valueFn;
}

/**
 * @param visData
 * @returns {string|undefined}
 */
export function getDateHistogram(visData) {
  const schema = visData.columns.find((column) => column.name === 'Cohort Date');
  if (schema && schema.meta.type === 'date_histogram') {
    return schema.meta.aggConfigParams.interval;
  }
}

/**
 * @param {array} data
 * @param {function} valueFn
 * @returns {function}
 */
export function getHeatMapColor(data, valueFn) {
  const domain = d3.extent(data, valueFn);
  domain.splice(1, 0, d3.mean(domain));
  return d3.scale.linear().domain(domain).range(colors);
}

/**
 * @param {string} d
 * @param {object} column
 * @returns {string}
 */
export function getMeanColor(d, column) {
  return d3.scale.linear().domain([column.min, column.mean, column.max]).range(colors)(d);
}

/**
 * @param {number} d
 * @param {object} column
 * @returns {string}
 */
export function getAboveAverageColor(d, column) {
  if (d > column.mean) {
    return green;
  } else if (d === column.mean) {
    return yellow;
  } else if (d < column.mean) {
    return red;
  }
}

/**
 * @param {string} mapColors
 * @param {array} data
 * @param {function} valueFn
 * @returns {function}
 */
export function getColorScale(mapColors, data, valueFn) {
  if (mapColors === 'heatmap') {
    return getHeatMapColor(data, valueFn);
  } else if (mapColors === 'mean') {
    return getMeanColor;
  } else if (mapColors === 'aboveAverage') {
    return getAboveAverageColor;
  } else {
    return () => {};
  }
}

/**
 * @param {*} x
 * @returns {number}
 */
const parseNumber = (x) => {
  if (typeof x === 'number' && !isNaN(x)) return x;
  const n = parseFloat(x);
  return isNaN(n) ? 0 : n;
};

/**
 *
 * @param {object} esData
 * @param {string|undefined} dateHistogram
 * @returns {array}
 */
export function processData(esData, dateHistogram) {
  if (!(Array.isArray(esData.rows) && esData.rows.length)) {
    return [];
  }

  //ToDo to be fixed dynamically ....
  const data = esData.rows.map((row) => {
    return {
      date: dateHistogram ? new Date(row['col-0-2']) : row['col-0-2'],
      period: parseNumber(row['col-2-3']),
      total: parseNumber(row['col-1-1']),
      value: parseNumber(row['col-3-1']),
    };
  });

  const cumulativeData = {};
  return data.map((d) => {
    const lastValue = cumulativeData[d.date] || 0;
    d.cumulativeValue = lastValue + d.value;
    cumulativeData[d.date] = d.cumulativeValue;
    return d;
  });
}
