import * as React from "react"
import { useCallback, useMemo, useState } from "react";
import { graphql } from "gatsby"
import Layout from "../components/layout";
import ProjectDetail from "../components/project-detail";
import Seo from "../components/seo";

const Project = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title
  const project = useMemo(() => [
      { company: "SK", name: "V 컬러링", period: "2020.01 ~ 현재" },
      {
        company: "SK",
        name: "SK 동의정보 지킴이",
        period: "2019.10 - 2019.12",
      },
      { company: "SK", name: "SKT 스마트홈", period: "2019.06 - 2019.09" },
      { company: "SK", name: "모바일 T world", period: "2018.04 - 2019.05" },
      { company: "SK", name: "콘텐츠소다", period: "2017.09 - 2018.03" },
      { company: "SK", name: "와우브릭", period: "2016.01 - 2016.07" },
      {
        company: "LG",
        name: "모바일 보안 솔루션 (MDM) 관리자 콘솔",
        period: "2011.01 - 2015.12",
      },
      {
        company: "LG",
        name: "대한생명 및 LG전자 등 포털 서비스 개발",
        period: "2009.07 - 2010.12",
      },
      {
        company: "LG",
        name: "LIG손해보험 시스템 차세대 전환 및 운영",
        period: "2008.01 - 2009.06",
      },
    ],
    []
  )

  const skProject = useMemo(() => project.filter(item => item.company === "SK"), [project])

  const [toggle, setToggle] = useState(project.map(_item => ({ isOpened: false })))

  const setToggleInfo = useCallback(index => {
      setToggle([
        ...(toggle || []).slice(0, index),
        { isOpened: !(toggle || [])[index].isOpened },
        ...(toggle || []).slice(index + 1),
      ])
    },
    [toggle]
  )

  const getLGIndex = useMemo(() => index => skProject.length + index, [skProject])

  return (
    <Layout location={location} title={siteTitle}>
      <div className="project">
        <ul>
          <li className="title">SK Planet</li>
          {project
            .filter(item => item.company === "SK")
            .map((data, index) => (
              <li 
                key={index}
                className={`icon ${
                  (toggle || [])[index]?.isOpened ? "up" : "down"
                }`}
                onClick={() => setToggleInfo(index)}
              >
                <span className="name">{data.name}</span>
                <span className="period">{data.period}</span>
                {(toggle || [])[index].isOpened ? (
                  <ProjectDetail childKey={index} />
                ) : null}
              </li>
            ))}
        </ul>
        <ul>
          <li className="title">LG CNS</li>
          {project
            .filter(item => item.company === "LG")
            .map((data, index) => (
              <li
                key={getLGIndex(index)}
                className={`icon ${
                  (toggle || [])[getLGIndex(index)]?.isOpened ? "up" : "down"
                }`}
                onClick={() => setToggleInfo(getLGIndex(index))}
              >
                <span className="name">{data.name}<br/><span className="period">{data.period}</span></span>
                {(toggle || [])[getLGIndex(index)].isOpened ? (
                  <ProjectDetail childKey={getLGIndex(index)} />
                ) : null}
              </li>
            ))}
        </ul>
      </div>
    </Layout>
  )
}

export const Head = () => {
  return (
    <Seo
      title="공자윤의 프로젝트"
    />
  )
}

export default Project

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`