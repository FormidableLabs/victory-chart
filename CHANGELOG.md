# VictoryChart Changelog

## 26.0.1 (2018-04-25)

-[591](https://github.com/FormidableLabs/victory-chart/pull/591) Ensure that `VictoryVoronoiContainer` works correctly with `VictoryGroup` data.

## 26.0.0 (2018-04-21)

**Breaking Changes**

-[587](https://github.com/FormidableLabs/victory-chart/pull/587) Disable styles on data

This change deprecates Victory's ability to automatically pick up style attributes from the data object. This change will improve performance, but will be a breaking change for many users. Fortunately the upgrade path is simple:

If your data object looks like
```
data={[
  { x: 1, y: 1, fill: "red", opacity: 0.2 },
  ...
]}
```
Add the following functional styles:
```
style={{ data:  { fill: (d) => d.fill, opacity: (d) => d.opacity } }}
```
and everything will work as before.

-[584](https://github.com/FormidableLabs/victory-chart/pull/584) Check for labels prop before computing baseProps for labels

Base props for labels will no longer be pre-calculated unless a labels prop exists. This change improves performance, but it will be a breaking change for users who were using events for adding labels to elements that did not already have them using an event mutation like:

```
events={[{
  target: "data",
  eventHandlers: {
    onClick: () => {
      return [{ target: "labels", mutation: () => ({ text: "clicked" }) }];
    }
  }
}]}
```
If you are using this pattern, you can make labels work as expected by adding a dummy labels prop like: `labels={() => null}`

Note: This change _does not_ affect tooltips, which exist, but are invisible until they receive the `active` prop

Other changes
-[589](https://github.com/FormidableLabs/victory-chart/pull/589) Audit lodash methods
-[583](https://github.com/FormidableLabs/victory-chart/pull/583) Perf improvement for `VictorySelectionContainer`

## 25.2.5 (2018-04-17)

- [583](https://github.com/FormidableLabs/victory-chart/pull/583) Perf improvements for `VictorySelectionContainer` and general perf improvements from `victory-core@21.1.12`

## 25.2.4 (2018-04-13)

- [581](https://github.com/FormidableLabs/victory-chart/pull/580) Add `react-fast-compare`, use in place of `lodash.isEqual`; add demo that uses <VictoryLabel/> and calls shouldComponentUpdate.

## 25.2.3 (2018-04-10)

- [580](https://github.com/FormidableLabs/victory-chart/pull/580) Improvements for `VictoryBrushLine`

## 25.2.2 (2018-04-04)

- Upgrade to `victory-core@^21.1.2`.
- [577](https://github.com/FormidableLabs/victory-chart/pull/577). Replace lodash omit. Remove any style prop scrubbing (`victory-core` now handles this).


## 25.2.1 (2018-03-30)

-[576]https://github.com/FormidableLabs/victory-chart/pull/576 Fixes a bug in `VictoryBrushLine`

## 25.2.0 (2018-03-27)

-[557](https://github.com/FormidableLabs/victory-chart/pull/557) `VictoryBoxPlot`
-[575](https://github.com/FormidableLabs/victory-chart/pull/575) Stack datasets with differeing domains
-[574](https://github.com/FormidableLabs/victory-chart/pull/574) Refactor helper method exports

## 25.1.1 (2018-02-14)

-[573](https://github.com/FormidableLabs/victory-chart/pull/573) Use fallback styles in VictoryBrushLine

## 25.1.0 (2018-02-12)

-[571](https://github.com/FormidableLabs/victory-chart/pull/571)
  - Adds `selectionBlacklist` to `VictorySelectionContainer`
  - Adds `activateData` and `activateLabels` to `VictoryVoronoiContainer` (true by default)
  - Adds `activateSelectedData` to `VictorySelectionContainer` (true by default)
-[572](https://github.com/FormidableLabs/victory-chart/pull/572) Changes behavior of `labels` in `VictoryVoronoiContainer`
  - `labels` is now called with `point, index, points` instead of `point, active`. This will not be a breaking change for most users, as this function was only called when labels were `active`

## 25.0.6 (2018-02-09)

-[570](https://github.com/FormidableLabs/victory-chart/pull/570) Add "minus" option for `VictoryScatter` `symbol` prop
-[569](https://github.com/FormidableLabs/victory-chart/pull/569) Fixes a bug in `createContainer`
-[568](https://github.com/FormidableLabs/victory-chart/pull/568) Adds `brushAreaWidth` prop for `VictoryBrushLine`
-[567](https://github.com/FormidableLabs/victory-chart/pull/567) Fixes brushArea active state in `VictoryBrushLine`

## 25.0.5 (2018-02-07)

-[565](https://github.com/FormidableLabs/victory-chart/pull/565) Prevent re-renders with disable prop

## 25.0.4 (2018-02-07)

-[564](https://github.com/FormidableLabs/victory-chart/pull/564) Adds `disable` prop to all interactive containers and addon components

## 25.0.3 (2018-02-07)

-[563](https://github.com/FormidableLabs/victory-chart/pull/563) `stopPropagation` in when panning or selection `VictoryBrushLine`

## 25.0.2 (2018-02-06)

-[562](https://github.com/FormidableLabs/victory-chart/pull/562) Bugfix for `VictoryCursorContainer`

## 25.0.1 (2018-02-05)

-[560](https://github.com/FormidableLabs/victory-chart/pull/560) Add `sideEffects: false`
-[561](https://github.com/FormidableLabs/victory-chart/pull/561) Bugfix for createContainer

## 25.0.0 (2018-02-04)

**Major Features**
- `VictoryBrushLine` for multi-brush support

**Breaking Changes**
  - `Candle` expects a new set of props from `VictoryCandlestick`
  - The `Line` component has been renamed to `Axis` / `Grid`
  - Internal methods for _all_ Victory primitive components have changed. This will be a breaking change for users who are extending primitive components, including `victory-native`.

-[551](https://github.com/FormidableLabs/victory-chart/pull/551) Bux fixes and improvements for VictoryStack
-[553](https://github.com/FormidableLabs/victory-chart/pull/553) Allow renderInPortal to be false for tooltips in `VictoryVoronoiContainer`
-[554](https://github.com/FormidableLabs/victory-chart/pull/554) Add support for `wickStrokeWidth` in `VictoryCandlestick`
  **This is a breaking change as the expected props for `Candle` are changed**
-[556](https://github.com/FormidableLabs/victory-chart/pull/556) Fixes undefined context variable
-[558](https://github.com/FormidableLabs/victory-chart/pull/558) Allow `func` PropType for `color` on `VictoryGroup`
-[559](https://github.com/FormidableLabs/victory-chart/pull/559) Implement `VictoryBrushLine` and use updated primitive components
  **This is a breaking change for anyone using the `Line` primitive. It has been renamed to `Axis` / `Grid`.
  **This may be a breaking change for anyone who was _extending_ Victory primitives**

## 24.6.1 (2018-01-08)

- [550](https://github.com/FormidableLabs/victory-chart/pull/550) Fixes a bug related to voronoi tooltip positioning
- [549](https://github.com/FormidableLabs/victory-chart/pull/549) Fixes a prop type warning for `categories` supplied to `VictoryAxis`
- [548](https://github.com/FormidableLabs/victory-chart/pull/548) Adds a `voronoiBlacklist` prop to `VictoryVoronoiContainer`
- [547](https://github.com/FormidableLabs/victory-chart/pull/547) Fixes downsampling in `VictoryZoomContainer` with function plotting
- [545](https://github.com/FormidableLabs/victory-chart/pull/545) Fixes a bug related to panning in `VictoryZoomContainer`

## 24.6.0 (2018-01-02)

- [544](https://github.com/FormidableLabs/victory-chart/pull/544)
- [victory-core/324](https://github.com/FormidableLabs/victory-core/pull/324) Adds support for external event mutations
  - Adds `externalEventMutations` prop to `VictorySharedEvents` and all components enhanced with the `add-events` HOC
  - `externalEventMutations` prop format:
  ```
externalEventMutations: PropTypes.arrayOf(PropTypes.shape({
  callback: PropTypes.function,
  childName: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ]),
  eventKey: PropTypes.oneOfType([
    PropTypes.array,
    CustomPropTypes.allOfType([CustomPropTypes.integer, CustomPropTypes.nonNegative]),
    PropTypes.string
  ]),
  mutation: PropTypes.function,
  target: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array
  ])
}))
```
*Note:* `eventKey` and `target` must be specified for externalEventMutations. When using `extenalEventMutations` with shared events (_i.e._ events on VictoryChart etc), `childName` is also required.

*Note:* The `callback` supplied to `externalEventMutations` should be used for clearing mutations. This is crucial for animating charts

## 24.5.1 (2018-01-02)

- [543](https://github.com/FormidableLabs/victory-chart/pull/543) Fixes a bug related to dates in `VictoryBrushContainer`
- [545](https://github.com/FormidableLabs/victory-chart/pull/545) Fixes a bug in `VictoryZoomContainer`

## 24.5.0 (2017-12-21)

- [542](https://github.com/FormidableLabs/victory-chart/pull/542) Adds support for immutable data *note: compatible with `immutable@v3.8.x` and will be compatible with `immutable@v4.0.x` when released*

## 24.4.0 (2017-12-17)
- [541](https://github.com/FormidableLabs/victory-chart/pull/541) Implements `sortOrder` prop with "ascending" and "descending" options

## 24.3.1 (2017-12-08)

- [540] (https://github.com/FormidableLabs/victory-chart/pull/540) Adds `allowSelection` boolean prop for `VictorySelectionContainer` (true by default)

## 24.3.0 (2017-11-14)

- [538](https://github.com/FormidableLabs/victory-chart/pull/538) Adds `barRatio` and `cornerRadius` props to `VictoryBar`

- [539](https://github.com/FormidableLabs/victory-chart/pull/539) Fixes a bug in bubble plots

## 24.2.0 (2017-11-07)

- [534](https://github.com/FormidableLabs/victory-chart/pull/534) Add `allowResize` and `allowDrag` props for `VictoryBrushContainer`
- [537](https://github.com/FormidableLabs/victory-chart/pull/537) Update infrastructure for React 16

## 24.1.0 (2017-10-22)

- [532](https://github.com/FormidableLabs/victory-chart/pull/532) Filters tickValues so that values outside of the domain of an axis are not included

## 24.0.0 (2017-10-19)

**Breaking Changes**

- [527](https://github.com/FormidableLabs/victory-chart/pull/527)
  - adds an `invertAxis` prop for `VictoryAxis` that will flip the domain of a given axis when true. Changing the `orientation` prop of a given axis will no longer flip the domain on that axis _unless_ the `invertAxis` prop is also set.
  - `tickFormat` as an array will set the number of ticks if `tickValues` are not given.
  - `tickValues` will be forced to a unique array. `tickFormat` may still have non-unique values.
  - `tickCount` will now always have an effect when set. Previously, this prop would do nothing when `tickValues` were provided. Now `tickCount` will downsample any array provided to either `tickValues` or `tickFormat`.

Other Changes

- [529](https://github.com/FormidableLabs/victory-chart/pull/529) `VictoryChart` no longer calculates `tickValues` or `tickFormat` for axis children. `stringMap` and `categories` are passed to axis components instead.

- [528](https://github.com/FormidableLabs/victory-chart/pull/528) and [530](https://github.com/FormidableLabs/victory-chart/pull/530) Remove numeric keys from styles

- [526](https://github.com/FormidableLabs/victory-chart/pull/526) Always set animation state

## 23.0.1 ( 2017-10-04)

-[524](https://github.com/FormidableLabs/victory-chart/pull/524) Fix naming changes for `VictoryCursorContainer`

## 23.0.0 (2017-09-30)

**BREAKING CHANGES:**

**[victory-core/299](https://github.com/FormidableLabs/victory-core/pull/299) Containers are now rendered in parent divs.** This may be a breaking change for parent styles.


**[518](https://github.com/FormidableLabs/victory-chart/pull/518) Naming changes for container props**

`VictoryBrushContainer`
- `dimension` -> `brushDimension`
- `selectionComponent` -> `brushComponent`
- `selectedDomain` -> `brushDomain`
- `selectionStyle` -> `brushStyle`
- `onDomainChange` -> `onBrushDomainChange`

`VictoryCursorContainer`
- `dimension` -> `cursorDimension`
- `onChange` -> `onCursorChange`

`VictorySelectionContainer`
- `dimension` -> `selectionDimension`

`VictoryVoronoiContainer`
- `dimension` -> `voronoiDimension`

`VictoryZoomContainer`
- `dimension` -> `zoomDimension`
- `onDomainChange` -> `onZoomDomainChange`

**Other Changes**
- [516](https://github.com/FormidableLabs/victory-chart/pull/516) Ensure that `VictoryZoomContainer` respects `clipId`
- [517](https://github.com/FormidableLabs/victory-chart/pull/517) `VictoryZoomContainer` and `VictoryVoronoiCOntainer` should ignore legend children
- [519](https://github.com/FormidableLabs/victory-chart/pull/519) Adds an `alignment` prop for `VictoryBar` so that bars may be rendered with "start", "middle" (default), or "end" alignment relative to their value.
- [520](https://github.com/FormidableLabs/victory-chart/pull/520) Adds an `allowPan` prop for `VictoryZoomContainer`. (Default true)
- [521](https://github.com/FormidableLabs/victory-chart/pull/521) Changes how children of `VictoryZoomContainer` are clipped to enable better zooming for `VictoryPortal`
- [522](https://github.com/FormidableLabs/victory-chart/pull/522) Fixes a bug in `VictoryZoomContainer` that effected time scale charts with `zoomDomain` specified

## 22.0.0 (2017-09-09)

- Updates to `victory-core@18.0.0` which includes breaking changes for `VictoryTooltip` styling.

## 21.6.2 (2017-08-19)

- [511](https://github.com/FormidableLabs/victory-chart/pull/511) Bugfix: VictoryZoomContainer works properly with VictoryPortal wrapped children
- [512](https://github.com/FormidableLabs/victory-chart/pull/512) Bugfix: fix allowZoom prop for panning only (broken by [496](https://github.com/FormidableLabs/victory-chart/pull/496))

## 21.6.1 (2017-08-09)

- [510](https://github.com/FormidableLabs/victory-chart/pull/510) Render axis line under other axis elements

## 21.6.0 (2017-08-08)

- [504](https://github.com/FormidableLabs/victory-chart/pull/504) bugfix: padding bug in `VictoryCursorContainer`
- [505](https://github.com/FormidableLabs/victory-chart/pull/505) Support touch events on all containers
- [506](https://github.com/FormidableLabs/victory-chart/pull/506) Add `props` argument for `VictoryVoronoiContainer` callbacks
- [507](https://github.com/FormidableLabs/victory-chart/pull/507) bugfix: Support array styles for `VictoryLabel` when it is used as a direct child of `VictoryChart` or other wrappers
- [508](https://github.com/FormidableLabs/victory-chart/pull/508) Add support for `animate` as a boolean prop
- [509](https://github.com/FormidableLabs/victory-chart/pull/509) Add `props` as the last argument for all container callbacks

## 21.5.0 (2017-08-02)

- [502](https://github.com/FormidableLabs/victory-chart/pull/502) Fix bug in `VictoryZoomContainer`
- [503](https://github.com/FormidableLabs/victory-chart/pull/503) Add downsample option for `VictoryZoomContainer`
- [504](https://github.com/FormidableLabs/victory-chart/pull/504) Fix padding bug in `VictoryCursorContainer`

## 21.4.0 (2017-07-24)

- [496](https://github.com/FormidableLabs/victory-chart/pull/496) `VictoryZoomContainer` improvements for real-time, updating data
- [497](https://github.com/FormidableLabs/victory-chart/pull/497) bugfix: apply `domainPadding` to explicit domains
- [498](https://github.com/FormidableLabs/victory-chart/pull/498) `VictoryAxis` determines its own default `tickFormat`
- [499](https://github.com/FormidableLabs/victory-chart/pull/499) Fix label prop merge order for `VictoryVoronoiContainer` labels
- [500](https://github.com/FormidableLabs/victory-chart/pull/500) Support performance improvements for evented components _e.g._ `VictoryArea`, `VictoryBar` ...

## 21.3.0 (2017-07-13)

- [495](https://github.com/FormidableLabs/victory-chart/pull/495) Support Webpack 3 and ES6 exports

## 21.2.4 (2017-07-09)

- [494](https://github.com/FormidableLabs/victory-chart/pull/494) Ensure that `tickFormat` has access to `tick`, `index`, and `ticks`

## 21.2.3 (2017-07-02)

- [491](https://github.com/FormidableLabs/victory-chart/pull/491) Corrects dependent axis for `innerRadius`

## 21.2.2 (2017-07-02)

- [490](https://github.com/FormidableLabs/victory-chart/pull/490) Fixes a bug in domain calculation for polar axes

## 21.2.1 (2017-07-02)

- [488](https://github.com/FormidableLabs/victory-chart/pull/488) `VictoryZoomContainer` only updates the domain in the dimension it controls
- [489](https://github.com/FormidableLabs/victory-chart/pull/489) Adds support for `innerRadius` on polar charts

## 21.2.0 (2017-06-29)

[484](https://github.com/FormidableLabs/victory-chart/pull/484) Remove inappropriate interpolation options for `VictoryArea` and `VictoryLine`
[487](https://github.com/FormidableLabs/victory-chart/pull/487) Fix a bug in `VictoryPolarAxis` domain calculation

## 21.1.4 (2017-06-22)

[482](https://github.com/FormidableLabs/victory-chart/pull/482) Add `minBubbleSize` prop to `VictoryScatter`

## 21.1.3 (2017-06-21)

[481](https://github.com/FormidableLabs/victory-chart/pull/481) Conditional `preventDefault` for `VictoryZoomContainer`

## 21.1.2 (2017-06-15)

[480](https://github.com/FormidableLabs/victory-chart/pull/480) Refactors `VictoryPolarAxis` to support native version

## 21.1.1 (2017-06-13)

- Use explicit minimum version of `victory-core`

## 21.1.0 (2017-06-12)

[479](https://github.com/FormidableLabs/victory-chart/pull/479)
  - Allows multiple dependent axes in `VictoryChart` (all will use the same domain, so normalizing data is necessary)
  - Fixes axis labels for `VictoryPolarAxis`
  - Adds an `axisValue` convenience helper so that users don't need to calculate an `axisAngle` for a given x value

[478](https://github.com/FormidableLabs/victory-chart/pull/478)
  - Changes how domains are calculated when there is only one data point. After this change, domains will no longer be arbitrarily include zero.

## 21.0.0 (2017-06-06)

[466](https://github.com/FormidableLabs/victory-chart/pull/466) Polar Charts
[475](https://github.com/FormidableLabs/victory-chart/pull/475) Brush and Zoom fixes
[476](https://github.com/FormidableLabs/victory-chart/pull/476) Zoom Improvements

**Breaking Changes**
- Changes how default widths are calculated for `VictoryBar` and groups of bars
- Removes default bar widths from themes

**Overview**
 - Supports polar charts by adding the `polar` prop to charts.
 - Polar charts are supported for `VictoryArea`, `VictoryChart`, `VictoryGroup`, `VictoryLine`, `VictoryScatter` `VictoryStack` and `VictoryVoronoi`
 - Polar charts are supported for `VictoryBar`, but horizontal (radial) bars are not yet supported
 - Polar charts work with `VictoryVoronoiContainer`
 - Polar charts work with `VictorySelectionContainer`, but the dimension prop is not supported for polar selections
 - Polar charts work with `VictoryZoomContainer`, but zooming is limited to centered radial zooming. Panning has no effect.
 - Polar-specific default animations for `VictoryLine` and `VictoryArea`
 - *horizontal polar charts are not yet supported*
 - *`VictoryCandlestick` and `VictoryErrorBar` do not yet work with polar charts*
 - *`VictoryCursorContainer` does not yet work with polar charts*
 - *`VictoryBrushContainer` does not work with polar charts*
 - *`VictoryZoomContainer` has limitations for polar charts*

**Planned additional work**
  - Support for radial bars
  - Support for spider charts (i.e. linear grid lines rather than arcs on polar charts)
  - Support separate theming for polar charts (at least axes)
  - Support for a polar version of `VictoryCursorContainer`
  - Minimal support for polar versions of `VictoryCandleStick` and `VictoryErrorBar` (Elements will be correctly positioned and angled, but path elements will not be altered to reflect curvature, _i.e._ candles will still be `rects` rather than arc paths)
  - Investigate hollow polar charts

**Details**
- Adds `VictoryPolarAxis` with new props: `axisAngle` `startAngle`, `endAngle`, and `labelPlacement`
- Adds `polar`, `startAngle`, `endAngle`, and `defaultPolarAxes` props for `VictoryChart`
- Adds `polar`, `origin`, and `range` props to all chart types.
- Adds `defaultPolarTransitions` static methods to `VictoryLine` and `VictoryArea`
- Uses `LabelHelpers` to simplify all `helper-methods`


## 20.0.0 (2017-05-24)

**Breaking Changes**
-[471](https://github.com/FormidableLabs/victory-chart/pull/471) Passes the string value of ticks to the tickFormat function rather than the associated index. **This may be a breaking change for users who are using categorical data and formatting tick values by index**

**Minor Changes**
-[474](https://github.com/FormidableLabs/victory-chart/pull/474) Adds support for a y0 accessor so that users can have granular control over the baseline of components like `VictoryArea`
-[472](https://github.com/FormidableLabs/victory-chart/pull/472) Fixes a bug that was cuasing VictoryGroup to override styles on any independent VictoryLabel children


## 19.1.1 (2017-05-12)

- Export `CursorHelpers`

## 19.1.0 (2017-05-12)

- [469](https://github.com/FormidableLabs/victory-chart/pull/469) Adds `VictoryCursorContainer`
- [victory-core/243](https://github.com/FormidableLabs/victory-core/pull/243) Impovements to `VictoryContainer`
  - Automatic `overflow: "visible"` for elements rendered in `VictoryPortal` (tooltips)
  - `VictoryContainer` no longer renders `g` tags (this was causing confusion with evented containers)
  - Default responsive styles are now `width: "100%"` `height: "100%"` (fixes a bug in safari)
  - Changes the merge order for responsive styles so that `width` and `height` attrs may be overridden
- [468](https://github.com/FormidableLabs/victory-chart/pull/468) Uses new `VictoryContainer` and adds
`renderInPortal` prop to the default label component rendered by continuous data types (`VictoryLine` and `VictoryArea`) so that labels are not clipped.

## 19.0.0 (2017-05-02)

**BREAKING CHANGE**
- Updates to `react@^15.5.0`
- Uses separate `prop-types` package
- Projects using Victory must also depend on `prop-types`

## 18.2.1 (2017-04-20)

- add `RawZoomHelpers` and `makeCreateContainerFunction`
- `combineContainerMixins` handles arbitrary number of mixins
- upgrade `victory-core` to get `getSVGEventCoordinates` native support

## 18.2.0 (2017-04-04)

- Adds `createContainer` for creating containers with multiple behaviors (e.g. Zoom and Voronoi)
- Adds `combineContainerMixins` and mixins for all containers for combining custom containers
- Correct styling bug for containers
- Correct theme propagation for containers
- Support `victory-native` upgrade.

## 18.1.4 (2017-03-21)

- [447](https://github.com/FormidableLabs/victory-chart/pull/447) Improves performance for container components
- Fixes [#511](https://github.com/FormidableLabs/victory/issues/511)
- Fixes [#526](https://github.com/FormidableLabs/victory/issues/526)

## 18.1.3 (2017-03-15)

- Removes unnecessary props from group components
- Fixes a bug with domainPadding in grouped bar charts

## 18.1.2 (2017-03-14)

- [441](https://github.com/FormidableLabs/victory-chart/pull/441)
- Support for better multi-repo tooling

## 18.1.1 (2017-03-10)

- Fixes a bug that was causing unnecessary `VictoryClipContainer` components to be rendered by `VictoryZoomContainer`

## 18.1.0 (2017-03-03)

- Adds `onActivated` and `onDeactivated` callbacks for `VictoryVoronoiContainer`
- Supports `VictoryClipContainer` on all components (as groupComponent)

## 18.0.0 (2017-02-27)

[438](https://github.com/FormidableLabs/victory-chart/pull/438)
**Breaking Changes**
- `VictoryZoomContainer` now zooms both x and y dimensions, use the prop `dimension="x"` to return to the old behavior
- `VictoryZoomContainer` now centers zoom behavior on the mouse position rather than the center of the chart
- `VictoryZoomContainer` has a minimum zoom level of the extent of the domain / 1000. Set a custom minimum with the `minimumZoom` prop, which takes an object with numeric values for x and/ or y.
- `VictoryBrushContainer` no longer has `dimension="x"` as the default value.

## 17.0.1 (2017-02-25)

[437](https://github.com/FormidableLabs/victory-chart/pull/437)
- Fixes a bug with `VictoryZoomContainer` panning behavior

## 17.0.0 (2017-02-25)

[432](https://github.com/FormidableLabs/victory-chart/pull/432)

**This is a breaking change for `VictoryLine` and `VictoryArea` charts using the `label` prop**

- Adds `VictoryVoronoiContainer` for hover events (tooltips). `VictoryVoronoiContainer` has several benefits over `VictoryVoronoi` and `VictoryVoronoiTooltip`
  - Supports multi-dataset voronoi
  - Much better performance (voronoi polygons are not actually rendered, so the number of nodes rendered is dramatically lower)
  - Supports multi-data tooltips
  - Supports rectangular selections with a dimension prop
    _i.e._ `dimension="x"` creates vertical hover areas for every unique x value in all child data

- Deprecates `label` in favor of `labels` in `VictoryLine` and `VictoryArea`, allowing individual data labels for these components like in other Victory components. This will be a breaking change for anyone using the `label` prop in `VictoryLine` or `VictoryArea`. Series labels will need to be configured manually

- Changes how null values are handled in `VictoryArea`, and groups all line and area segments (i.e. split by null values) into the same `eventKey`, so that they operate as a single line for the purposes of events.

## 16.1.2 (2017-02-05)

- [431](https://github.com/FormidableLabs/victory-chart/pull/431)
- Sets a maximum amount of scale per zoom event for smoother interaction with fast onWheel events

## 16.1.1 (2017-02-03)

- Correct export of `SelectionHelpers`

## 16.1.0 (2017-02-03)

- [429](https://github.com/FormidableLabs/victory-chart/pull/429)
- Throttles `onWheel` and `onMouseMove` events on Victory container components
- Exports container event helpers

## 16.0.1 (2017-02-01)

- [428](https://github.com/FormidableLabs/victory-chart/pull/428)
- Fixes a bug in `VictoryBrushContainer`

## 16.0.0 (2017-01-30)

- [427](https://github.com/FormidableLabs/victory-chart/pull/427)
- Adds `VictoryBrushContainer`
- Adds `VictoryZoomContainer`
- **Deprecates `VictoryZoom`**
- Changes default styles for `VictorySelectionContainer`
- Adds override-able `selectionComponent` for `VictorySelectionContainer`
- Adds `domain` and `standalone` to list of props that get stored in parent state
- Simplifies and standardizes container rendering across components.

[See pull request for examples](https://github.com/FormidableLabs/victory-chart/pull/427)


## 15.0.1 (2017-01-06)

- Add `bounds` as the second argument for VictorySelectionContainer `onSelection` callback

## 15.0.0 (2017-01-03)

- Adds `VictorySelectionContainer`
- All functional styles and props are evaluated at the level of the primitive component rather than eariler
- Adds support for `defaultEvents` on `containerComponents`

## 14.0.4 (2016-12-13)

- Fixes date handling in VictoryZoom

## 14.0.3 (2016-12-12)

- Fixes an animation bug with continuous children.

## 14.0.2 (2016-12-09)

- Fixes VictoryZoom bugs related to events and render order.

## 14.0.1 (2016-12-07)

- Fixes an [animation bug](https://github.com/FormidableLabs/victory/issues/444) by removing data accessor props from the animation whitelist

## 14.0.0 (2016-12-02)

- Change how continuous animations behave _i.e._ VictoryArea and VictoryLine
  - clipPath curtain will never be smaller than the range except during `onLoad`
- Fixes a bug where paths defining bars were not being closed.

## 13.2.4 (2016-21-16)

- Fixes a bug with `VictoryAxis` offsets
- Adds an `allowZoom` prop that can turn on / off zooming on VictoryZoom. This prop is `true` by default

## 13.2.3 (2016-18-09)

- fix broken timer on unmount

## 13.2.2 (2016-11-09)

- Get timer only when needed

## 13.2.1 (2016-11-09)

- Code style consistency

## 13.2.0 (2016-11-09)

- Adds `VictoryZoom` to enable panning and zooming on charts

## 13.1.1 (2016-10-31)

- Stricter npmignore

## 13.1.0 (2016-10-26)

- Uses `publishr` to reduce npm installed package size [#413](https://github.com/FormidableLabs/victory/issues/413)
- Fixes a bug where label padding was not being applied to tick labels [#408](https://github.com/FormidableLabs/victory/issues/408)
- Changes how the domain is calculated when there is only one data point, or when the minimum and maximum of the data is equal in a given dimension [#407](https://github.com/FormidableLabs/victory/issues/407)
- Ensures that ticks array is not empty after filtering zeroes for crossed axes
- Fixes naming for "stack" and "group" roles

## 13.0.3 (2016-10-26)

- Allow npm 2 install
- Add `shouldAnimate` conditional for victory-native compatibility

## 13.0.2 (2016-10-19)

- Fix date bug in `VictoryGroup`
- Ensure axis ticks always exist

## 13.0.1 (2016-10-18)

- Update `victory-core` for react native support
- Fix bugs in exit transitions for continuous data components (line, area)

## 13.0.0 (2016-10-13)

- Upgrades all d3 packages
- Greater consistency of props for props passed to primitive components
- Adds `VictoryPortal` which renders any child elements in a top level portal container if it exists
- Adds `VictoryClipContainer` which renders children in a group container with a `clipPath` if `clipPath` props exist
- `VictoryArea` and `VictoryLine` use `VictoryClipContainer` as their `groupComponent`
- Removes `clipPath` properties from `VictoryLine` and `VictoryArea`
- Extracts event logic into a new inverted inheritance higher order component `addEvents` which is used by all chart components
- Moves `Data`, `Domain`, and `Scale` helpers from `victory-chart` to `victory-core`
- Fixes date related domain bugs
- Fixes stacking for time scale data
- Supports separate theming for x and y axes

## 12.0.1 (2016-09-15)

- Fixes ordering in stacked and grouped data
- Fixes minor tooltip bugs
- Removes unused `flyoutProps` prop from `VictoryVoronoiTooltip`

## 12.0.0 (2016-09-09)

- Adds support for `VictoryTooltip`
- Adds `VictoryVoronoi` component
- Adds `VictoryVoronoiTooltip`
- Moves all primitive rendered components to `victory-core` where they are exported for external use
- Enhances `VictoryGroup` so that it can accept a `data` prop which it will pass to all children. This also allows groups of components to be stacked as one
- Adds support for `defaultEvents` in any primitive component (_i.e._ `dataComponent`, `labelComponent`)
- Adds `onLoad` animations
- Adds a `sortKey` prop to `VictoryLine` to allow sorting by fields other than "x"
- Adds a `fixLabelOverlap` boolean prop to `VictoryAxis`. When enables, this feature renders a smaller subset of ticks when the full set of ticks would cause overlapping labels. This feature is currently limited to evenly spaced labels.
- Fixes a bug related to `bubbleProperty` in `VictoryScatter`
- Allows string data in `VictoryCandlestick` and `VictoryErrorBar`
- Performance optimizations

## 11.0.1 (2016-08-21)

- Refactors ClipPath component to make it easier to write a native version.

## 11.0.0 (2016-08-18)

**This release includes breaking changes for Themes**
- Updates the VictoryTheme API to more closely match the props object
- Uses `VictoryTheme.grayscale` for default styling
- Fixes a bug related to bar width
- Improves performance by simplifying scale type checking for VictoryBar and VictoryArea
- Fixes default transitions for VictoryBar and VictoryArea
- Adds documentation for VictoryTheme

## 10.3.0 (2016-08-11)

- Improved animation for continuous data components (_i.e._ VictoryLine, VictoryArea) using clipPath
- Support for arrays of `childName` in events
- Adds `displayName` to all component for ease of debugging / testing

## 10.2.6 (2016-08-04)

- Fix bug in automatic domainPadding
- Fix bug in generated data
- Fix bug in domainPadding for stacked charts
- Fix colorScale in wrapped components

## 10.2.5 (2016-08-02)

- Fix animation bug in VictoryCandlestick
- Fix label bug in VictoryCandlestick
- Fix style bug in VictoryCandlestick
- Fix axis orientation for negative charts
- Clean up documentation

## 10.2.4 (2016-08-01)

- Fix label style bug

## 10.2.3 (2016-08-01)

- Fix minor errorbar bug

## 10.2.2 (2016-07-29)

- Fix tick style bug

## 10.2.1 (2016-07-29)

- Update `victory-core`
- Removes `reduce-calc-css`

## 10.2.0 (2016-07-29)

- Performance improvements across all components
- Supports asymmetric `domainPadding`
- Supports `domainPadding` on all child components
- Adds automatic `domainPadding` for grouped bars
- Fixes [bugs related to log scales](https://github.com/FormidableLabs/victory-chart/pull/317)
- Fixes [a bug related to time scales](https://github.com/FormidableLabs/victory-chart/pull/318)
- Improves consistency for charts with empty and single value data arrays

## 10.1.0 (2016-07-15)

- Adds VictoryErrorBar
- Changes default styles to the greyscale theme
- Auto-width enhancement for VictoryBar
- Aria roles for all rendered elements
- Supports negative domain padding

## 10.0.0 (2016-07-07)

- Adds support for Victory Native
  - Adds `containerComponent` and `groupComponent` props to all components

## 9.2.1 (2016-06-30)

- Changes helper methods to make horizontal bar chart behavior more intuitive

## 9.2.0 (2016-06-17)

- Supports events on the parent element via the `parent` namespace in the `events` prop.
- `parent` events have access to `width`, `height`, `style` and the calculated `scale` (with `domain` and `range` already applied). Where applicable `parent` events also have access to `data`
- Shared `parent` events are automatically supported in components that use `VictorySharedEvents` by default (_i.e._ VictoryChart, VictoryGroup, VictoryStack)
- When mutating elements via the return from event handlers, mutation objects may now take arrays for `eventKey` to target several individual elements, or the special value "all" to apply changes to all elements of a particular target type
- Fixes a bug related to an incorrect default `tickFormat` for dates
- FIxes a bug related to incorrect axis label placement

## 9.1.3 (2016-06-14)

- Alters the render order for children of `VictoryChart` so that _default_ axes are always rendered before other children. When axes are explicitly defined children of `VictoryChart` will  still be rendered in the order they are defined.
- Alters the render order of elements within `VictoryAxis` so that grid elements are rendered before ticks and tick labels
- Fixes a bug in `VictoryGroup` that was causing custom `labelComponents` of its children to be overridden.

## 9.1.2 (2016-06-13)

- Pre-calculates and applies VictoryAxis transform to individual elements. This allows custom axis components (_i.e._ `tickLabelComponent`) to be absolutely positioned by overriding position props

## 9.1.1 (2016-06-13)

- Custom component props get precedence over calculated props

## 9.1.0 (2016-06-13)

- Fixes bugs related to horizontal bar charts
- Fixes bugs related to label transfroms
- Increases default font sizes for readability
- Adds basic aria roles
- Adds support for custom container elements
- Adds vectorEffect non-scaling-stroke to support responsive charts

## 9.0.0 (2016-06-01)

- Upgrades to React 15
- Supports wrapped components
- Updates the events API to support shared events **This is a breaking change for events**

## 8.0.0 (2016-05-13)

 - improves consistency for `labelComponent` and `dataComponent` props. Replaces a custom `SliceLabel` component with `VictoryLabel` to make the api more consistent and predictable. **This is a breaking change for custom label components**, as `VictoryLabel` expects a different set of props than the previous `SliceLabel` component. See [VictoryLabel](http://formidable.com/open-source/victory/docs/victory-label) for more detail.

 - Custom components are now supported for all rendered axis elements (axis, axisLabel, grid, ticks, tickLabels)

 - All data and label components now have access to scale so that they can create correctly scaled elements from data i.e. error bars.

- Functional styles and props are now all evaluated before they are passed as props to `labelComponent` or `dataComponent`, so that custom components will have access to the final values.

- events are bound and partially applied prior to being passed as props to `labelComponent` or `dataComponent`

- it is now possible to specify `angle` and `verticalAnchor` props for` VictoryLabel` via the style object

- event return values are stored differently on state to facilitate interaction between data and labels. **This is a breaking change for events** as event handlers must now return an object with with `data` and/or `labels` keys so that these values may be applied appropriately to data and label elements respectively.

## 7.0.0 (2016-04-15)

- VictoryBar and VictoryArea no longer support multiple datasets.
- VictoryStack and VictoryGroup define stacked and grouped layouts for their children
- Custom data components supported on for VictoryBar, VictoryLine, VictoryScatter,
  VictoryArea via the `dataComponent` prop
- Enter and exit transitions animate. Enter and exit transition defaults defined
  VictoryBar, VictoryArea, VictoryScatter, and VictoryLine. Custom transitions may be
  defined via the `onExit` and `onEnter` properties of the `animation` prop
- Top level svgs are all responsive by default (using svg viewBox). To render a fixed size
  component, set the `standalone` prop to false and render the component inside an svg tag

## 6.0.0 (2016-03-14)

- Add VictoryArea component
- Add event handling via an `events` prop
- Update to lodash 4
- Update `d3-shape` to the latest version (minor breaking changes on interpolation types)
- Updates via `builder-victory-component` to support Babel 6
- Provide label text via a `text` prop rather than children

## 5.0.2 (2016-03-04)

- Add validation of length for `dataAttributes` prop
- Remove source-maps from git
- Various documentation fixes

## 5.0.1 (2016-03-01)

- Provide datum to victory-line custom label
- Upgrade to `victory-core@1.0.0`

## 5.0.0 (2016-02-26)

- VictoryBar, VictoryLine, VictoryScatter, and VictoryAxis are now all part of the VictoryChart repo.
- VictoryChart depends on VictoryCore instead of VictoryUtil, VictoryLabel, and VictoryAnimation individually.
- VictoryChart no longer depends on Radium
- Significant rendering performance improvements

## 4.0.0 (2016-01-30)

- Supports data accessor functions!
[more detail](https://github.com/FormidableLabs/victory/issues/84)
- Application dependencies like `radium` and `lodash` now live in components, not in the Builder archetype. This is a breaking change. https://github.com/FormidableLabs/victory/issues/176

## 3.0.0 (2016-01-26)

- Upgrade to Radium 0.16.2. This is a breaking change if you're using media queries or keyframes in your components. Please review upgrade guide at https://github.com/FormidableLabs/radium/blob/master/docs/guides/upgrade-v0.16.x.md

## 2.2.0 (2016-1-21)

- Extracted shared code into `victory-util`
- Increased unit test coverage to ~75%

## 2.1.3 (2015-12-30)

- update archetype

## 2.1.2 (2015-12-30)

- Fixed a bug in `victory-bar` that was causing the cumulative max on stacked bar charts to be overestimated
- Fixed a bug related to date formatting in Firefox

## 2.1.1 Alpha (2015-12-18)

Functional styles and functional props (where appropriate) for child components

using `d3-modules` instead of all of `d3`

Basic code coverage.

We make no promises about any code prior to this release.
