import * as React from "react"

const Footer = () => (
  <footer className="footer">
    Copyright © <a href="https://www.jayoon.work" target="_blank" rel="noreferrer">Jayoon Kong</a>
    {` ${new Date().getFullYear()}`},
    all right reserved.
  </footer>
)

export default Footer