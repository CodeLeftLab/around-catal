const config = {width: 700, height: 800, mobileWidth: 300, mobileHeight: 800, ridgeHeight: 18, formatTime: d3.timeFormat('%Y'),}; // set config object
const isMobile = window.innerWidth < 600 ? true : false;
const margin = { top: 30, right: 30, bottom: 50, left: 50 }, width = (isMobile ? config.mobileWidth : config.width) - margin.left - margin.right, 
height =  (isMobile ? config.mobileHeight : config.height) -  margin.top -   margin.bottom;
const y = d => d.n;const yScale = d3.scaleLinear();const yValue = d => yScale(y(d)); // Y scale in each ridge
const section =d=> d.key;const sectionScale=d3.scaleOrdinal().range([0, 260, 390, 580, 740]);const sectionValue =d=> sectionScale(section(d));const sectionAxis=d3.axisLeft(sectionScale);// Sections scale
const termScale = d3.scaleBand().range([0, 10]);// Main container y scale

// from our dataset coming out of a require(), parse strings into dates, ints, etc. nest groups by key, and it's just great
const formatData = function(dataset) {const parseTime = d3.timeParse('%Y-%m-%d');  dataset.map(d => {  return (d['time'] = parseTime(d.week)), (d['n'] = parseInt(d.n));});
  const groups = d3  .nest()  .key(d => d.category_label)  .key(d => d.term_label)  .entries(dataset); return groups;};// sort, etc
const setupXScale = function(config) {const x = d => d.time; const xScale = d3.scaleTime().range([30, width]); const xValue = d => xScale(x(d)); // Date scale
  const xAxis = d3 .axisBottom(xScale) .tickFormat(config.formatTime) .ticks(4); return { x, xScale, xValue, xAxis };};

const makeSection = (config, xValue) => {return function(data) {  const area = d3 .area() .defined(d => d).x(xValue).y1(yValue)  .curve(d3.curveBasisOpen); const line = area.lineY1();
    termScale.domain(data.values.map(d => d.key)); const areaChartHeight = 1.5 * (100 / termScale.domain().length); //const areaChartHeight = config.ridgeHeight;
    yScale.domain([0, 10]).range([areaChartHeight, 0]);   area.y0(yScale(0));
    let ridges=d3 .select(this).append('g').selectAll('.foo').data(d => d.values).enter().append('g').at({class:d => 'term term--'+ d.key}).translate((d, i)=>{return [0, i * config.ridgeHeight]; });
    ridges.append('text').data(d => d.values).text(d => d.key).st({ textAnchor: 'end' }).translate(config.width < 500 ? [-20, yScale(0) - 5] : [20, yScale(0)]);
    ridges.append('path').at({ class: 'area' }).datum(d => d.values) .at({ d: area });
    ridges.append('path').at({ class: 'line' }).datum(d => d.values) .at({ d: line }); };};
	
d3.select('#times-joyplot').html('');// Clean up before drawing // By brutally emptying all HTML from plot container div
const svg = d3 .select('#times-joyplot').at({  width: isMobile ? config.mobileWidth : config.width,   height: isMobile ? config.mobileHeight : config.height, }).st({ backgroundColor: '#F8F7F1' })
  .append('g').translate([margin.left, margin.top]);
// x axis
const { x, xScale, xValue, xAxis } = setupXScale(config);xScale.domain([new Date('2014-01-01'), new Date()]);
svg .append('g') .at({ class: 'axis axis--x' }) .translate([0, height]) .call(xAxis);
d3.json('./data/data.json', (error, dataset) => {if (error) throw error;
const data = formatData(dataset);  // console.log(data);
sectionScale.domain(data.map(d => d.key));
const sections = svg .selectAll('.section') .data(data) .enter() .append('g') .at({class: d => 'section section--' + d.key.split(' ').join('').toLowerCase(),}).translate(d => [0, sectionValue(d)]);
  svg.append('g').at({ class: 'axis axis--term' }) .st({ textAnchor: 'start' }) .translate([margin.left + margin.right, -10]) .call(sectionAxis);
  sections.each(makeSection(config, xValue));
  const campaignDates = [new Date('2015-06-15'), new Date('2016-11-08')];
  svg.append('rect').at({x: xScale(campaignDates[0]),y: 0,width: xScale(campaignDates[1]) - xScale(campaignDates[0]),height: config.height - margin.top - margin.bottom - 10, class: 'campaign', });
});
