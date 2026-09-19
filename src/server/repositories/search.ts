import { prisma } from "@/server/db/prisma";
export async function globalSearch(workspaceId: string, query: string) {
    const q = query.trim();
    if (q.length < 2)
        return [];
    const [opportunities, clients, projects] = await Promise.all([
        prisma.opportunity.findMany({ where: { workspaceId, OR: [{ title: { contains: q, mode: "insensitive" } }, { source: { contains: q, mode: "insensitive" } }] }, include: { client: true }, take: 5, orderBy: { updatedAt: "desc" } }),
        prisma.client.findMany({ where: { workspaceId, OR: [{ companyName: { contains: q, mode: "insensitive" } }, { contactName: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }, take: 5, orderBy: { updatedAt: "desc" } }),
        prisma.project.findMany({ where: { workspaceId, name: { contains: q, mode: "insensitive" } }, include: { client: true }, take: 5, orderBy: { updatedAt: "desc" } })
    ]);
    return [
        ...opportunities.map(x => ({ id: x.id, type: "Opportunity", title: x.title, subtitle: x.client?.companyName ?? x.source, href: `/opportunities/${x.id}` })),
        ...clients.map(x => ({ id: x.id, type: "Client", title: x.companyName, subtitle: x.contactName, href: `/clients/${x.id}` })),
        ...projects.map(x => ({ id: x.id, type: "Project", title: x.name, subtitle: x.client.companyName, href: `/projects/${x.id}` }))
    ];
}
