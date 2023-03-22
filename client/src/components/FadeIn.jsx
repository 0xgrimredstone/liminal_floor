import React, { Component } from "react";

const UNMOUNTED = "unmounted";
const EXITED = "exited";
const ENTERING = "entering";
const ENTERED = "entered";
const EXITING = "exiting";

const transitionStyles = {
  entering: { visibility: 0.1 },
  entered: { visibility: 1 },
  exiting: { visibility: 0.1 },
  exited: { visibility: 0.1 }
};

class FadeIn extends Component {
  constructor(props) {
    super(props);

    this.state = { status: UNMOUNTED };
  }

  componentDidMount() {
    const { show } = this.props;
    if (show) {
      this.performEnter();
    }
  }

  componentDidUpdate(prevProps) {
    let nextStatus = null;
    if (prevProps !== this.props) {
      const { status } = this.state;
      if (this.props.show) {
        if (status !== ENTERING && status !== ENTERED) {
          nextStatus = ENTERING;
        }
      } else {
        if (status === ENTERING || status === ENTERED) {
          nextStatus = EXITING;
        }
      }
    }
    this.updateStatus(nextStatus);
  }

  updateStatus(nextStatus) {
    if (nextStatus !== null) {
      if (nextStatus === ENTERING) {
        this.performEnter();
      } else {
        this.performExit();
      }
    } else if (this.state.status === EXITED) {
      this.setState({ status: UNMOUNTED });
    }
  }

  performEnter() {
    this.setState({ status: ENTERING }, () => {
      setTimeout(() => {
        this.setState({ status: ENTERED }, () => {});
      }, 0);
    });
  }

  performExit() {
    const { duration } = this.props;
    this.setState({ status: EXITING }, () => {
      setTimeout(() => {
        this.setState({ status: EXITED }, () => {});
      }, duration);
    });
  }

  render() {
    const { status } = this.state;
    if (status === UNMOUNTED) {
      return null;
    }

    const { children, duration, className, style } = this.props;
    return (
      <div
        className={className}
        style={{
          ...style,
          width:"100%",
          height:"100%",
          transition: `visibility ${duration}ms ease-in-out`,
          visibility: 0.1,
          ...transitionStyles[status]
        }}
      >
        {children}
      </div>
    );
  }
}

FadeIn.defaultProps = {
  show: false,
  duration: 300
};

export default FadeIn;
