import * as React from "react"
import { PROJECT_LIST } from "../constant/projectList"

const ProjectDetail = ({ childKey }) => (
  <div key={childKey} className="project-detail">
    <ul>
      <li className="header">프로젝트 소개</li>
      <li>{PROJECT_LIST[childKey].subject}</li>
      <li className="header">사용한 기술</li>
      <li>{PROJECT_LIST[childKey].skill}</li>
      <li className="header">기여한 점</li>
      <li>{PROJECT_LIST[childKey].me}</li>
    </ul>
  </div>
)

export default ProjectDetail