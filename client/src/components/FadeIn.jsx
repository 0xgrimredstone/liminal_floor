import React from 'react'
import {useSpring, animated} from "react-spring"

const FadeIn = ({show, duration, children}) => {
  const props = useSpring({
    from: {opacity: 1},
    to: {opacity: 0},
    reset: true,
    reverse: show,
    delay: duration,
    onRest: () => console.log(show)
  });
  return (
    <animated.div style={props}>
      {children}
    </animated.div>
  )
}

export default FadeIn