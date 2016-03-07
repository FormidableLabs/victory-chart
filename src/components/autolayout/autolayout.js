import React, { Children, Component, PropTypes, cloneElement } from "react";
import { View } from "autolayout";

const componentWithLayoutProps = (component, view) => {
  if (!component) {
    return null;
  }

  const {
    children: rawChildren,
    viewName,
    intrinsicWidth,
    intrinsicHeight,
    constraints,
    mapLayoutToProps
  } = component.props;

  if (view && constraints) {
    view.addConstraints(
      constraints.map((constraint) => constraint.build())
    );
  }

  const children = typeof rawChildren !== "string"
    ? Children.map(rawChildren, (child) => {
      return componentWithLayoutProps(child, view);
    })
    : rawChildren;

  const subViews = view.subViews;
  const layout = viewName && subViews[viewName]
    ? subViews[viewName]
    : null;

  if (viewName && !layout) {
    console.warn(`Constraint failed for ${viewName}!`);
  }

  if (layout && intrinsicWidth) {
    layout.intrinsicWidth = intrinsicWidth;
  }

  if (layout && intrinsicHeight) {
    layout.intrinsicHeight = intrinsicHeight;
  }

  let mappedProps;
  if (layout && mapLayoutToProps) {
    mappedProps = Object.keys(mapLayoutToProps)
      .reduce((acc, key) => {
        return {...acc, [key]: layout[mapLayoutToProps[key]]};
      }, {});
  }

  return cloneElement(component, {
    children,
    ...mappedProps || null,
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

export default class AutoLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: new View({
        constraints: props.constraints
          ? props.constraints.map(
            (constraint) => constraint.build()
          )
          : null,
        width: props.width,
        height: props.height,
        spacing: 0
      })
    };
  }

  render() {
    const Container = this.props.container;
    const root = <Container>{this.props.children}</Container>;
    return componentWithLayoutProps(
      root, this.state.view
    );
  }
}

class Constraint {
  constructor(leftView, leftAttr) {
    this.constraint = {
      view1: leftView,
      attr1: leftAttr
    };
  }

  equals(rightView, rightAttr) {
    this.constraint = {
      ...this.constraint,
      relation: "equ",
      view2: rightView,
      attr2: rightAttr
    };
    return this;
  }

  lessThanOrEqualTo(rightView, rightAttr) {
    this.constraint = {
      ...this.constraint,
      relation: "leq",
      view2: rightView,
      attr2: rightAttr
    };
    return this;
  }

  greaterThanOrEqualTo(rightView, rightAttr) {
    this.constraint = {
      ...this.constraint,
      relation: "geq",
      view2: rightView,
      attr2: rightAttr
    };
    return this;
  }

  constant(constant) {
    this.constraint = {
      ...this.constraint,
      relation: "equ",
      attr2: "const",
      constant
    };
    return this;
  }

  plus(constant) {
    this.constraint = {
      ...this.constraint,
      constant
    };
    return this;
  }

  minus(constant) {
    this.constraint = {
      ...this.constraint,
      constant: -constant
    };
    return this;
  }

  times(multiplier) {
    this.constraint = {
      ...this.constraint,
      multiplier
    };
    return this;
  }

  withPriority(priority) {
    this.constraint = {
      ...this.constraint,
      priority
    };
    return this;
  }

  build() {
    return this.constraint;
  }
}

export const constrain = (leftView, leftAttr) => {
  return new Constraint(leftView, leftAttr);
};
