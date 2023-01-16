import * as React from "react"

const Footer = () => (
  <footer className="footer">
    Copyright © Jayoon Kong
    {` ${new Date().getFullYear()}`},
    all right reserved.
  </footer>
)

export default Footer