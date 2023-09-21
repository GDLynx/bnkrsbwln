import React, { Fragment, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Canvas, useFrame } from 'react-three-fiber'
import { DoubleSide } from 'three'
import { Html, OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { Debug, Physics, useBox, usePlane, useSphere } from '@react-three/cannon'

import './styles.css'

function Ball(props) {
  //  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  const [ref, api] = useSphere(() => ({ args: [0.5], mass: 1, position: [props.position[0], 3, 0] }), useRef(null))
  useFrame(() => {
    // this is'll do for now, but useRapier looks to be a
    // physics engine which compiles to WASM with a simpler API
    // I'm yet to see if there are much examples but it has a
    // README explaining a lot such as movement etc
    // so I'll likely switch to that in the future assuming
    // the setup isn't too frustrating
    // yeah Ima swap to Rapier
    // api.rotation.set(props.rotation)
    window.setTimeout(() => {
      api.velocity.set(2, 0, 0)
    }, 5000)
  })
  //useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  //useFrame(() => ref.current.position.x += 1 * props.direction)
  return (
    <mesh position={props.position} ref={ref}>
      {/* what is the args prop? */}
      <sphereGeometry args={[0.6, 50, 50]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

function _Ball(props) {
  //  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  const [ref, api] = useSphere(() => ({ args: [0.5], mass: 1, position: [props.position[0], 3, 0] }), useRef(null))
  const [prevDelta, setPrevDelta] = useState(0)
  const [frameCount, setFrameCount] = useState(0)
  const [rotationRate, setRotationRate] = useState(0)
  const [direction, setDirection] = useState(true)
  useFrame((state, delta) => {
    //    props.velocity != undefined ? api.velocity.set(props.velocity[0], props.velocity[1], props.velocity[2]) : null
    // https://github.com/pmndrs/react-three-fiber/discussions/1991#discussioncomment-1962835
    // console.log(delta)
    const prevDelta = delta
    setPrevDelta(delta)
    const differenceInDelta = prevDelta - delta
    /* 
    Based on ?'s video about the incorrect use of delta (within Unity) 
    I am going to just have the ball fall on like the 10th frame 
    essentially whatever frame looks like 10 seconds 
    but again this is not fair as it gives an unfair advantage to 
    players with slower FPS 
    So in the actual game I'll likely just have 
    all players tap the screen to say their ready 
    And/or (depending on multiplayer) have the "swipe" 
    trigger the fall 
    */
    // if (differenceInDelta == X) {/*make ball fall */}
    /// _Ball.setState(prevDelta: prevDelta)
    /* I vaguely recall seeing a React Don't Dos which 
    suggested this counter logic is wrong but it'll do for now  */
    //console.log('prev frameCount: ', frameCount)
    setFrameCount((frameCount) => (frameCount += 1))
    //if (frameCount > 100) {
    // 100 is arbitrary but works
    // make ball fall
    //  console.log('make ball fall')
    //api.velocity.set(0, -2, 0)

    // I'd likely pass this down as a prop if multiple objects need this
    window.addEventListener('devicemotion', (event) => {
      const rads = (event.rotationRate.gamma * Math.PI) / 180
      // api.rotation
      setRotationRate(rads)
      if (Math.floor(rads) > 10) {
        api.velocity.set(-2, 0, 0)
        console.log('moving left')
      }

      if (Math.floor(rads) < -10) {
        api.velocity.set(2, 0, 0)
        console.log('moving right')
      }
      console.log(event.rotationRate.gamma, rads, Math.floor(rads))

      /* 
      window.setInterval(() => {
        setDirection(!direction)
      }, 100)
      if (direction) {
        api.velocity.set(-2, 0, 0)
      } else {
        api.velocity.set(2, 0, 0)
      }
      console.log('Vel: ', api.velocity.x, direction)
      */
    })
    //  }
  })
  //useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  //useFrame(() => ref.current.position.x += 1 * props.direction)
  return (
    <mesh position={props.position} ref={ref}>
      {/* what is the args prop? */}
      <sphereGeometry args={[0.6, 50, 50]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

function StillBall(props) {
  //  useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  {
    /* what is the args property? */
  }
  const [ref, api] = useSphere(() => ({ args: [0.66], mass: 1, position: [props.position[0], 3, 0] }), useRef(null))
  //useFrame(() => (ref.current.rotation.x = ref.current.rotation.y += 0.01))
  //useFrame(() => ref.current.position.x += 1 * props.direction)
  return (
    <mesh position={props.position} ref={ref}>
      <sphereGeometry args={[0.6, 10, 10]} />
      <meshNormalMaterial attach="material" />
    </mesh>
  )
}

function Plane() {
  {
    /* not sure why the rotation property results in the plane 
  not being rendered other than maybe due to the Drei & react-three-fiber 
 versions?  
Actually the Math.PI appears to be the issue :/ 
*/
  }
  const [ref] = useBox(
    () => ({
      args: [3.4, 1, 3],
      onCollide: (e) => console.log(e.contact.impactVelocity),
      type: 'Kinematic'
    }),
    useRef(null)
  )

  return (
    <mesh ref={ref} position={[0, 0, 0]} /* rotation={[Math.PI / 2, 0, 0]} */ scale={[5, 5, 5]} rotation={[1, 0, 0]}>
      <planeBufferGeometry />
      <meshBasicMaterial color="green" side={DoubleSide} />
    </mesh>
  )
}

// https://react.dev/learn/reusing-logic-with-custom-hooks
function DetectSwipe() {
  const [isTouching, setIsTouching] = useState(false) 
  /* 
  Rather than counting how many intervals (e.g. milliseconds) the 
  user has been touching the screen for
  I think I should instead be getting the Y of when the player started 
  touching the screen 
  and the Y of when the player stopped touching the screen 
  then using the difference between the start point, and 
  the end point as the strength / speed value for the ball 
  e.g. Y_start = 3, Y_end = 4; difference = Y_start - Y_end 
  (or Y_end - Y_start based on vector-vector); however, this may 
  mean that for touches to the lower part of the screen where the 
  Y is higher, then the swipe speed may be drastically bigger than 
  expected 

  But I don't need to consider the above (at least not yet) 
  And I don't think a "pullback" (similar to aiming a pull queue or 
    swinging a golf club) is the mechanic I want 

    Instead I am simply going to track the actual time (
    I'll likely just use Time.now() rather than doing any frame 
    related timing as described via https://www.youtube.com/watch?v=yGhfUcPjXuE

    So, when the player touches the screen, the current time 
    will be taken, and when the player removes their finger, 
    the time will also be recorded, the "strength of force"
    which is applied will be from fingerTouchStartTime - fingerTouchEndTime 
    (or vice versa), technically the player won't have to swipe, 
    but if I want to enforce a swipe, then I guess I could just 
    add an if statement which checks that the distance within a touchmove 
    is more than X (e.g. 1) 
  */
  const [touchDistance, setTouchDistance] = useState(0)
  useEffect(() => {
    document.querySelector("canvas").addEventListener("touchstart", (e) => {
      e.preventDefault() 
      setIsTouching(true)
      setTouchDistance(0) 
    })
    document.querySelector("canvas").addEventListener("touchend", (e) => {
      e.preventDefault() 
      setIsTouching(false)
      setTouchDistance(0)
    })
    document.querySelector("canvas").addEventListener("touchmove", (e) => {
      e.preventDefault() 
    // if isTouching
      setTouchDistance((currentTouchDistance) => {
      // see https://youtu.be/GGo3MVBFr1A?si=BnKNRmTEPi73UnFW&t=272
        return currentTouchDistance + 1
      })
    }) 
  }, []) 
  return (<div>Touch distance: {touchDistance}</div>)
}

ReactDOM.render(
  <Fragment> 
  <DetectSwipe /> 
  <Canvas style={{ height: '100vh', width: '100vw' }}>
    {/* todo: 
      - have the 2 balls fall & land on the plane (technically I could animate this using useFrame but I think I want real physics )  
    */}
    <Physics
      iterations={20}
      tolerance={0.0001}
      defaultContactMaterial={{
        contactEquationRelaxation: 1,
        contactEquationStiffness: 1e7,
        friction: 0.9,
        frictionEquationRelaxation: 2,
        frictionEquationStiffness: 1e7,
        restitution: 0.7
      }}
      gravity={[0, -4, 0]}
      allowSleep={false}>
      <Debug color="yellow" scale={1}>
        {/* dunno why the moving ball doesn't have the debug wireframe but it doesn't matter*/}
        {/* 
        <Ball position={[-1, 0, 3]} />
        <StillBall position={[1, 0, 3]} />
        */}
        {/* now its just a case of moving the ball after a few seconds, 
        originally I had baked window.setTimeout into the ball component's logic,
        but this is a bit hacky, I think RT-Fiber has a useClock hook, 
        also not sure where to put the useClock logic, I'll likely just 
        put it here (between the physics component, but in the future,  
        I may have a component which wraps the Ball component and appends 
        the functionality?) */}
        {/*
        // since this didn't work, I'd likely do this inside 
        an object manager component 
        window.setTimeout(() => {
          console.log('rendering ball')
          return <_Ball position={[-1, 0, 3]} velocity={[1, 0, 0]} />
        }, 30)
      */}
        <_Ball position={[-1, 0, 3]} velocity={[1, 0, 0]} />
        {/* <Ball position={[0.5, 0, 3]} rotation={[-1, 0, 0]} />*/}
        {/* not sure if the plane's rotation/angle is due to the camera , Im assuming the camera is facing down automatically*/}
        <Plane />
      </Debug>
    </Physics>
  </Canvas>
  </Fragment>,
  document.getElementById('root')
)
