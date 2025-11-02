// ...existing code...
import { db } from "../db/db.js";

/* post question (Student) */
export const postQuestion = async (req, res) => {
  try {
    // ensure auth middleware attached req.user
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "Student") return res.status(403).json({ message: "Forbidden" });

    const student_id = req.user.id;
    const { class_id, question, importance } = req.body;

    if (!class_id || !question) return res.status(400).json({ message: "class_id and question required" });

    // validate importance
    const allowed = ["Important", "Unimportant"];
    const imp = allowed.includes(importance) ? importance : "Unimportant";

    // verify class exists (optional: verify membership)
    const { data: cls, error: clsErr } = await db.from("classes").select("id").eq("id", class_id).maybeSingle();
    if (clsErr) return res.status(500).json({ message: "DB error", details: clsErr.message });
    if (!cls) return res.status(404).json({ message: "Class not found" });

    const { data, error } = await db
      .from("questions")
      .insert([{ class_id, student_id, question, importance: imp }])
      .select()
      .single();

    if (error) return res.status(500).json({ message: "Failed to post question", details: error.message });

    // return normalized object
    res.status(201).json({
      message: "Question posted",
      question: {
        id: data.id,
        class_id: data.class_id,
        student_id: data.student_id,
        question: data.question,
        importance: data.importance,
        status: data.status ?? "Unanswered",
        created_at: data.created_at
      }
    });
  } catch (err) {
    console.error("postQuestion error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* mark answered (Professor or TA) */
export const markAnswered = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!["Professor", "TA"].includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });

    const question_id = req.body.question_id ?? req.body.id;
    if (!question_id) return res.status(400).json({ message: "question_id required" });

    // optional: verify professor/TA has permission for this question (e.g. belongs to their class)

    const { data, error } = await db
      .from("questions")
      .update({ status: "Answered" })
      .eq("id", question_id)
      .select()
      .single();

    if (error) return res.status(500).json({ message: "Failed to update", details: error.message });
    if (!data) return res.status(404).json({ message: "Question not found" });

    res.status(200).json({ message: "Marked answered", question: data });
  } catch (err) {
    console.error("markAnswered error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* GET questions list (by class_id or student_id) */
export const getQuestions = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { class_id, student_id, status, importance } = req.query;
    let query = db.from("questions").select();

    if (class_id) query = query.eq("class_id", class_id);
    if (student_id) query = query.eq("student_id", student_id);
    if (status) query = query.eq("status", status);
    if (importance) query = query.eq("importance", importance);

    const { data, error } = await query.order("created_at", { ascending: false }).limit(100);
    if (error) return res.status(500).json({ message: "DB error", details: error.message });

    res.status(200).json({ data });
  } catch (err) {
    console.error("getQuestions error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};