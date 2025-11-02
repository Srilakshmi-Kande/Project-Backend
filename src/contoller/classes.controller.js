// ...existing code...
import { db } from "../db/db.js";

/* create class (Professor only) */
export const createClass = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "Professor") return res.status(403).json({ message: "Forbidden" });
    const professor_id = req.user.id;
    const { /* optional fields */ } = req.body;

    const { data, error } = await db.from("classes").insert([{ professor_id }]).select().single();
    if (error) return res.status(500).json({ message: "Failed to create class", details: error.message });

    res.status(201).json({ message: "Class created", class: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* join class (Student/TA) */
export const joinClass = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { class_code } = req.body;
    if (!class_code) return res.status(400).json({ message: "class_code required" });

    const { data: cls } = await db.from("classes").select().eq("class_code", class_code).maybeSingle();
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const { data, error } = await db.from("class_members").upsert([{ class_id: cls.id, user_id }], { onConflict: ["class_id", "user_id"] }).select();
    if (error) return res.status(500).json({ message: "Failed to join class", details: error.message });

    res.status(200).json({ message: "Joined class", class: cls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* leave class */
export const leaveClass = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { class_id } = req.body;
    if (!class_id) return res.status(400).json({ message: "class_id required" });

    const { error } = await db.from("class_members").delete().match({ class_id, user_id });
    if (error) return res.status(500).json({ message: "Failed to leave class", details: error.message });

    res.status(200).json({ message: "Left class" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* professor dashboard (uses view professor_dashboard) */
export const professorDashboard = async (req, res) => {
  try {
    if (req.user.role !== "Professor") return res.status(403).json({ message: "Forbidden" });

    const { data, error } = await db.from("professor_dashboard").select().eq("professor_id", req.user.id);
    if (error) return res.status(500).json({ message: "Failed to fetch", details: error.message });

    res.status(200).json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* TA dashboard (uses view ta_dashboard). Return rows related to classes TA joined */
export const taDashboard = async (req, res) => {
  try {
    if (req.user.role !== "TA") return res.status(403).json({ message: "Forbidden" });

    // get TA's classes
    const { data: memberClasses } = await db.from("class_members").select("class_id").eq("user_id", req.user.id);
    const classIds = (memberClasses || []).map(r => r.class_id);
    if (!classIds.length) return res.status(200).json({ data: [] });

    const { data, error } = await db.from("ta_dashboard").select().in("class_code", []); // fallback
    // ta_dashboard view doesn't include class_id; use join with classes table instead:
    const { data: rows, error: qerr } = await db.rpc("get_ta_dashboard_rows", { _class_ids: classIds }).catch(()=>({ data: null, error: null }));
    // If RPC not present, fallback to selecting from ta_dashboard and filtering by professor_id via classes lookup:
    if (qerr || !rows) {
      // simpler: join ta_dashboard with classes to filter
      const { data: filtered, error: ferr } = await db
        .from("ta_dashboard")
        .select("*")
        .in("professor_id", classIds); // may not match, but minimal approach
      if (ferr) return res.status(500).json({ message: "Failed to fetch TA dashboard", details: ferr.message });
      return res.status(200).json({ data: filtered });
    }

    res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};