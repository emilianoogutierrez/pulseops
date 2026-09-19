import { prisma } from "@/server/db/prisma";
export async function listProjects(workspaceId: string) {
    const projects = await prisma.project.findMany({
        where: { workspaceId },
        include: { client: true, deliverables: true },
        orderBy: { updatedAt: "desc" }
    });
    return projects.map((project) => {
        const accepted = project.deliverables.filter((item) => item.status === "ACCEPTED").length;
        const progress = project.deliverables.length
            ? Math.round((accepted / project.deliverables.length) * 100)
            : project.status === "CLOSED" || project.status === "DELIVERED" ? 100 : project.status === "REVIEW" ? 85 : project.status === "ACTIVE" ? 55 : 15;
        return {
            id: project.id,
            name: project.name,
            client: project.client.companyName,
            status: project.status,
            amount: Number(project.quotedAmount),
            collected: Number(project.collectedAmount),
            progress,
            dueAt: project.dueAt
        };
    });
}
export async function getProject(workspaceId: string, id: string) {
    return prisma.project.findFirst({
        where: { id, workspaceId },
        include: {
            client: true,
            opportunity: true,
            payments: { orderBy: { createdAt: "desc" } },
            deliverables: { orderBy: [{ position: "asc" }, { createdAt: "asc" }] },
            activities: { orderBy: { createdAt: "desc" } }
        }
    });
}
