import React, { Children, Component, PropTypes, cloneElement } from "react";
import { View } from "autolayout";

const componentWithLayoutProps = (component, view) => {
  const {
    children: rawChildren,
    viewName,
    intrinsicWidth,
    intrinsicHeight
  } = component.props;

  const children = typeof rawChildren !== "string"
    ? Children.map(rawChildren, (child) => {
      return componentWithLayoutProps(child, view);
    })
    : null;

  const subViews = view.subViews;
  console.log(subViews[viewName], viewName);
  const layout = viewName && subViews[viewName]
    ? subViews[viewName]
    : null;

  if (layout && intrinsicWidth) {
    layout.intrinsicWidth = intrinsicWidth;
  }

  if (layout && intrinsicHeight) {
    layout.intrinsicHeight = intrinsicHeight;
  }

  return cloneElement(component, {
    children,
    layout: layout ? {
      name: layout.name,
      top: layout.top,
      right: layout.right,
      bottom: layout.bottom,
      left: layout.left,
      width: layout.width,
      height: layout.height
    } : null
  });
};

export class AutoLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: new View({
        constraints: props.constraints,
        width: props.width,
        height: props.height,
        spacing: 0
      })
    };
  }

  render() {
    return componentWithLayoutProps(
      this.props.children, this.state.view
    );
  }
}

