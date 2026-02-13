import * as smallGroupsRepo from "../repos/small-groups.js";

export const create = async (data: { name: string }) => {
  return await smallGroupsRepo.create(data);
};

export const getRecent = async () => {
  return await smallGroupsRepo.getRecent();
};
