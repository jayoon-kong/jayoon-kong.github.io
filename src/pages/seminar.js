import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import poster from "../images/seminar_poster.png"

const Seminar = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title
  return (
    <Layout location={location} title={siteTitle}>
      <div className="seminar">
        <a
          href="https://devocean.sk.com/vlog/view.do?id=349&vcode=A03"
          target="_blank"
          rel="noreferrer"
        >
          <img src={poster} alt="poster" />
        </a>
      </div>
    </Layout>
  )
}

export default Seminar

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`
