-- Migration: Add symptom_system_tbl and symptoms_tbl
-- Safe to run multiple times on Railway

CREATE TABLE IF NOT EXISTS symptom_system_tbl (
    systemID INT NOT NULL,
    systemName VARCHAR(100) NOT NULL,
    PRIMARY KEY (systemID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS symptoms_tbl (
    symptomID INT NOT NULL,
    species ENUM('Cat', 'Dog') NOT NULL,
    symptomName VARCHAR(150) NOT NULL,
    featureName VARCHAR(150) NOT NULL,
    systemID INT NOT NULL,
    PRIMARY KEY (symptomID),
    KEY idx_symptoms_systemID (systemID),
    CONSTRAINT fk_symptoms_system
        FOREIGN KEY (systemID) REFERENCES symptom_system_tbl(systemID)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert data into symptom_system_tbl first
INSERT IGNORE INTO symptom_system_tbl (systemID, systemName)
VALUES
(2, 'Systemic'),
(3, 'Respiratory'),
(4, 'Gastrointestinal'),
(5, 'Metabolic / Urinary'),
(6, 'Vision'),
(7, 'Musculoskeletal'),
(8, 'Neurological'),
(9, 'Dental'),
(10, 'Dermatological'),
(11, 'Lymphatic'),
(12, 'Cardiovascular'),
(13, 'Other');

-- Insert data into symptoms_tbl
INSERT IGNORE INTO symptoms_tbl (symptomID, species, symptomName, featureName, systemID)
VALUES
(1, 'Dog', 'Fever', 'symptom_fever', 2),
(2, 'Dog', 'Lethargy', 'symptom_lethargy', 2),
(3, 'Dog', 'Depression', 'symptom_depression', 2),
(4, 'Dog', 'Pain', 'symptom_pain', 2),
(5, 'Dog', 'Discomfort', 'symptom_discomfort', 2),
(6, 'Dog', 'Weakness', 'symptom_weakness', 2),
(7, 'Dog', 'Coma', 'symptom_coma', 2),
(8, 'Dog', 'Collapse', 'symptom_collapse', 2),
(9, 'Dog', 'Lack of Energy', 'symptom_lack_of_energy', 2),
(10, 'Dog', 'Nasal Discharge', 'symptom_nasal_discharge', 3),
(11, 'Dog', 'Breathing Difficulty', 'symptom_breathing_difficulty', 3),
(12, 'Dog', 'Coughing', 'symptom_coughing', 3),
(13, 'Dog', 'Enlarged Liver', 'symptom_enlarged_liver', 4),
(14, 'Dog', 'Yellow Gums', 'symptom_yellow_gums', 4),
(15, 'Dog', 'Vomiting', 'symptom_vomiting', 4),
(16, 'Dog', 'Diarrhea', 'symptom_diarrhea', 4),
(17, 'Dog', 'Bloated Stomach', 'symptom_bloated_stomach', 4),
(18, 'Dog', 'Burping', 'symptom_burping', 4),
(19, 'Dog', 'Passing Gases', 'symptom_passing_gases', 4),
(20, 'Dog', 'Constipation', 'symptom_constipation', 4),
(21, 'Dog', 'Eating Grass', 'symptom_eating_grass', 4),
(22, 'Dog', 'Purging', 'symptom_purging', 4),
(23, 'Dog', 'Abdominal Pain', 'symptom_abdominal_pain', 4),
(24, 'Dog', 'Weight Loss', 'symptom_weight_loss', 5),
(25, 'Dog', 'Severe Dehydration', 'symptom_severe_dehydration', 5),
(26, 'Dog', 'Increased Drinking and Urination', 'symptom_increased_drinking_and_urination', 5),
(27, 'Dog', 'Glucose In Urine', 'symptom_glucose_in_urine', 5),
(28, 'Dog', 'Anorexia', 'symptom_anorexia', 5),
(29, 'Dog', 'Blood In Urine', 'symptom_blood_in_urine', 5),
(30, 'Dog', 'Urine Infection', 'symptom_urine_infection', 5),
(31, 'Dog', 'Difficulty Urinating', 'symptom_difficulty_urinating', 5),
(32, 'Dog', 'Acute Blindness', 'symptom_acute_blindness', 6),
(33, 'Dog', 'Cataracts', 'symptom_cataracts', 6),
(34, 'Dog', 'Gradual Losing Sight', 'symptom_losing_sight', 6),
(35, 'Dog', 'Blindness', 'symptom_blindness', 6),
(36, 'Dog', 'Eye Discharge', 'symptom_eye_discharge', 6),
(37, 'Dog', 'Excess Jaw Tone', 'symptom_excess_jaw_tone', 7),
(38, 'Dog', 'Lameness', 'symptom_lameness', 7),
(39, 'Dog', 'Stiff and Hard Tail', 'symptom_stiff_and_hard_tail', 7),
(40, 'Dog', 'Stiffness of Muscles', 'symptom_stiffness_of_muscles', 7),
(41, 'Dog', 'Continuously Erect and Stiff Ears', 'symptom_continuously_erect_and_stiff_ears', 7),
(42, 'Dog', 'Grinning Appearance', 'symptom_grinning_appearance', 7),
(43, 'Dog', 'Wrinkled Forehead', 'symptom_wrinkled_forehead', 7),
(44, 'Dog', 'Paralysis', 'symptom_paralysis', 8),
(45, 'Dog', 'Seizures', 'symptom_seizures', 8),
(46, 'Dog', 'Neurological Disorders', 'symptom_neurological_disorders', 8),
(47, 'Dog', 'Loss of Consciousness', 'symptom_loss_of_consciousness', 8),
(48, 'Dog', 'Excessive Salivation', 'symptom_excessive_salivation', 9),
(49, 'Dog', 'Swelling of Gum', 'symptom_swelling_of_gum', 9),
(50, 'Dog', 'Redness of Gum', 'symptom_redness_of_gum', 9),
(51, 'Dog', 'Receding Gum', 'symptom_receding_gum', 9),
(52, 'Dog', 'Bleeding of Gum', 'symptom_bleeding_of_gum', 9),
(53, 'Dog', 'Plaque', 'symptom_plaque', 9),
(54, 'Dog', 'Bad Breath', 'symptom_bad_breath', 9),
(55, 'Dog', 'Tartar', 'symptom_tartar', 9),
(56, 'Dog', 'Scratching', 'symptom_scratching', 10),
(57, 'Dog', 'Licking', 'symptom_licking', 10),
(58, 'Dog', 'Itchy Skin', 'symptom_itchy_skin', 10),
(59, 'Dog', 'Redness of Skin', 'symptom_redness_of_skin', 10),
(60, 'Dog', 'Face Rubbing', 'symptom_face_rubbing', 10),
(61, 'Dog', 'Fur Loss', 'symptom_fur_loss', 10),
(62, 'Dog', 'Red Bumps', 'symptom_red_bumps', 10),
(63, 'Dog', 'Scabs', 'symptom_scabs', 10),
(64, 'Dog', 'Irritation', 'symptom_irritation', 10),
(65, 'Dog', 'Dry Skin', 'symptom_dry_skin', 10),
(66, 'Dog', 'Red Patches', 'symptom_red_patches', 10),
(67, 'Dog', 'Dandruff', 'symptom_dandruff', 10),
(68, 'Dog', 'Smelly', 'symptom_smelly', 10),
(69, 'Dog', 'Wounds', 'symptom_wounds', 10),
(70, 'Dog', 'Swollen Lymph Nodes', 'symptom_swollen_lymph_nodes', 11),
(71, 'Dog', 'Sepsis', 'symptom_sepsis', 11),
(72, 'Dog', 'Pale Gums', 'symptom_pale_gums', 11),
(73, 'Dog', 'Heart Complication', 'symptom_heart_complication', 12),
(74, 'Dog', 'Aggression', 'symptom_aggression', 13),
(75, 'Dog', 'Hunger', 'symptom_hunger', 13);