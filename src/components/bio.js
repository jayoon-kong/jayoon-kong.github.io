/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useAuthor } from "../hooks/useAuthor"

const Bio = ({ author }) => {
  const { name, description, thumbnail, link } = useAuthor(author);
  return (
    <div className="bio">
      <img src={thumbnail} alt="profile" className="bio-avatar" />
      {author && (
        <p>
          {link ? <a href={link} target="_blank" rel="noreferrer"><strong>{name}</strong></a> : <strong>{name}</strong>}
          <br />
          {description}
        </p>
      )}
    </div>
  )
}

export default Bio
