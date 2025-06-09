import { ServiceException } from "@/shared/model/service.exception.model";
import userGroupService from "@/server/services/user-group.service";

export const updateGroupLimits = async (groupId: string, maxProjects: number, maxApps: number) => {
  try {
    await userGroupService.save({
      id: groupId,
      maxProjects,
      maxApps,
    });
    return { success: true };
  } catch (error) {
    throw new ServiceException("Failed to update group limits");
  }
};