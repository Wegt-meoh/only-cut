import * as z from "../utils/z";
import { MediaEditorSchema } from "../schemas/project-config";

export type MediaEditorProject = z.infer<typeof MediaEditorSchema>;