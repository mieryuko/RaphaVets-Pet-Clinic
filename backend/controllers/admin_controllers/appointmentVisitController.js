import db from "../../config/db.js";

export const getAppointmentAndVisits = async (req, res) => {
    try{
        const [appointments] = await db.execute(`
         SELECT
            a.*,
            p.petName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            sc.scheduleTime,
            s.statusName
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
         JOIN scheduletime_tbl sc on sc.scheduledTimeID = a.scheduledTimeID
         WHERE a.visitType = "Scheduled"
            AND a.isDeleted = FALSE
         ORDER BY a.appointmentDate ASC, a.scheduledTimeID ASC
         `);

        const [visits] = await db.execute(`
         SELECT
            a.*,
            p.petName,
            CONCAT(ac.firstName, ' ', ac.lastName) as ownerName,
            s.statusName
         FROM appointment_tbl a
         JOIN appointment_status_tbl s ON s.statusID = a.statusID
         JOIN pet_tbl p ON p.petID = a.petID
         JOIN account_tbl ac ON ac.accID = a.accID
         LEFT JOIN scheduletime_tbl st on st.scheduledTimeID = a.scheduledTimeID
         WHERE visitDateTime IS NOT NULL
            AND a.isDeleted = FALSE
         ORDER BY visitDateTime ASC
        `);
        
         const cleanedAppointments = appointments.map(apt => ({
            id: apt.appointmentID,
            petName: apt.petName,
            owner: apt.ownerName,
            date: new Date(apt.appointmentDate)
               .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
               }),
            time: new Date(`1970-01-01T${apt.scheduleTime}`)
               .toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
               }),
            status: apt.statusName,
            visitType: apt.visitType,
         }));

         const cleanedVisits = visits.map(vst => ({
            id: vst.appointmentID,
            petName: vst.petName,
            owner: vst.ownerName,
            date: new Date(vst.visitDateTime)
               .toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
               }),
            time: new Date(vst.visitDateTime)
               .toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
               }),
            visitType: vst.visitType,
            status: vst.status,
         }));

        res.status(200).json({cleanedAppointments, cleanedVisits});
    }catch(err){
        console.error("DB error: ",err)
        res.status(500).json({error: "Server error: " + err.message});
    }
}