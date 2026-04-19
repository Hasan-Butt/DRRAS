import { getDisasters, createDisaster, updateDisaster, deleteDisaster } from "./DisastersRoute";

export const dynamic = "force-dynamic";

export { getDisasters as GET, createDisaster as POST, updateDisaster as PATCH, deleteDisaster as DELETE };
