import AuditLog from "../models/auditlog.model.js";

const createAuditLog = async ({
  admin,
  action,
  resource,
  resourceId,
  description,
  metadata,
  req,
}) => {
  try {
    await AuditLog.create({
      admin,

      action,

      resource,

      resourceId,

      description,

      metadata,

      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"],

      userAgent: req?.headers?.["user-agent"],
    });
  } catch (error) {
    // Audit logging should not break
    // the main business operation.

    console.error("Audit log failed:", error.message);
  }
};

export default createAuditLog;
