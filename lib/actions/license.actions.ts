"use server";

import License from "../database/models/license.model";
import { connectToDatabase } from "../database/mongoose";

export async function getLicense() {
  try {
    await connectToDatabase();

    const license = await License.findOne();

    if (!license) {
      throw new Error("License and Agreement not found");
    }

    return {
      text: license.text,
      version: license.version,
    };
  } catch (error) {
    console.error("Error fetching license:", error);
    throw new Error("Internal Server Error");
  }
}
