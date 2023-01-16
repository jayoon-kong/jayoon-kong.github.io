import * as React from "react"
import { PROJECT } from "../pages/project"

const ProjectDetail = ({ childKey }) => (
  <div key={childKey} className="project-detail">
    <ul>
      <li className="header">프로젝트 소개</li>
      <li>{PROJECT[childKey].subject}</li>
      <li className="header">사용한 기술</li>
      <li>{PROJECT[childKey].skill}</li>
      <li className="header">기여한 점</li>
      <li>{PROJECT[childKey].me}</li>
    </ul>
  </div>
)

export default ProjectDetail