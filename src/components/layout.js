import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  const header = (
    <div className="main-heading">
      <StaticImage
        className="bio-avatar"
        layout="fixed"
        formats={["auto", "webp", "avif"]}
        src="../images/cony.png"
        width={50}
        height={50}
        quality={95}
        alt="Profile picture"
      />
      <Link to="/">{title}</Link>
    </div>
  )

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">{header}</header>
      <main>{children}</main>
      <footer className="footer">
        Copyright © <a href="https://www.jayoon.work">Jayoon Kong</a> {new Date().getFullYear()},
        all right reserved.
      </footer>
    </div>
  )
}

export default Layout
