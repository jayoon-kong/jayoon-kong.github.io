import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"

const Profile = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title
  const author = data.site.siteMetadata?.author

  return (
    <Layout location={location} title={siteTitle}>
      <div className="profile">
        <ul>
          <li className="title">Profile</li>
          <li>
            <span className="name">{author.name}</span>
          </li>
          <li className="me">
            <span className="about">{author.summary}</span>
          </li>
          <li>
            <span>SK Planet</span>2016.01 ~
          </li>
          <li>
            <span>LG CNS</span>2008.01 ~ 2015.12
          </li>
          <li>
            <span>한양대학교 정보기술경영학과</span>2004.03 ~ 2008.02
          </li>
        </ul>
        <ul>
          <li className="title">About me</li>
          <li>문제를 끝까지 해결하는 것을 좋아하고</li>
          <li>여러 가지 방법을 시도하면서</li>
          <li>조금씩 성장하고 있는 개발자입니다.</li>
        </ul>
      </div>
    </Layout>
  )
}

export const Head = () => {
  return (
    <Seo
      title="공자윤의 프로필"
    />
  )
}

export default Profile

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        author {
          name
          summary
        }
      }
    }
  }
`
