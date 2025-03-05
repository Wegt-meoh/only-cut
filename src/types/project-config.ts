import * as z from "../utils/z";
import { MediaEditorSchema } from "../schemas/project-config";

export type MediaEditorConfig = z.infer<typeof MediaEditorSchema>;

export type MediaEditorProject = { name: string, config: MediaEditorConfig }