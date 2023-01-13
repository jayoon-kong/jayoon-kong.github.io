import * as React from "react"
import { Link } from "gatsby"

const Menu = () => (
  <div className="menu">
    <Link to="/">blog</Link>
    <Link to="/profile">profile</Link>
    <Link to="/project">project</Link>
    <Link to="/seminar">seminar</Link>
  </div>
)

export default Menu