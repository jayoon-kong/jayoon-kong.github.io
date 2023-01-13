import { MEMBERS } from "../members";
import thumbnailDefault from "../members/images/default.png";

export function useAuthor(name) {
  const member = MEMBERS[name.toLowerCase()];
  if (member) {
    return {
      name: `${member.name} (${member.team})`,
      description: member.description,
      thumbnail: member.thumbnail || thumbnailDefault,
      link: member.link || null
    };
  }
  return {
    name,
    thumbnail: thumbnailDefault
  };
}