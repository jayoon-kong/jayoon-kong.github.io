import * as React from "react"
import { Link } from "gatsby"
import Menu from "./menu"
import cony from "../images/cony.png";

const Header = ({ title }) => (
  <header className="global-header">
    <div className="main-heading">
      <div className="logo">
        <img className="bio-avatar" src={cony} alt="logo" />
        <Link to="/">{title}</Link>
      </div>
      <Menu />
    </div>
  </header>
)

export default Header