export function sharedProfile(profile) {
  const { id, realName, university, department, status, avatarUrl, bio, roleOrCompany } = profile;
  const links = {};
  for (const key of ['website','github','behance','linkedin']) {
    try { const url = new URL(profile.links?.[key]); if (['http:','https:'].includes(url.protocol)) links[key] = url.href; } catch {}
  }
  return { id, realName, university, department, status, avatarUrl, bio, roleOrCompany, links,
    ...(profile.contact?.isPublic ? {contact:{email:profile.contact.email,phone:profile.contact.phone,isPublic:true}} : {}) };
}
export function sharedProjects(projects, user) {
  return projects.filter(p => p.author.id === user.id && p.isPublished === true).map(p => ({
    id:p.id, title:p.title, subtitle:p.subtitle, category:p.category, projectType:p.projectType,
    coverImageUrl:p.coverImageUrl, createdAt:p.createdAt, views:p.views, likes:p.likes,
    tags:p.tags, toolsUsed:p.toolsUsed, period:p.period, teamInfo:p.teamInfo, summary:p.summary,
    blocks:p.blocks, links:p.links, actionLinks:p.actionLinks, author:sharedProfile(user), isPublished:true,
  }));
}
