-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 09, 2025 at 05:48 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `raphavets_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `account_tbl`
--

CREATE TABLE `account_tbl` (
  `accId` int(11) NOT NULL,
  `roleID` int(11) NOT NULL,
  `firstName` varchar(250) NOT NULL,
  `lastName` varchar(250) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(250) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `passwordChangeAt` datetime NOT NULL DEFAULT current_timestamp(),
  `logInAt` datetime NOT NULL DEFAULT current_timestamp(),
  `logOutAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_tbl`
--

INSERT INTO `account_tbl` (`accId`, `roleID`, `firstName`, `lastName`, `email`, `password`, `createdAt`, `lastUpdatedAt`, `passwordChangeAt`, `logInAt`, `logOutAt`, `isDeleted`) VALUES
(2, 1, 'Mark', 'Mapiliiiiiiiiiiiii', 'markmapili28@gmail.com', '$2b$10$NNG154DuvS/ST/lInE1Pp.XyhniL6YtSE.3UaiAv6/OvON5uMi3MC', '0000-00-00 00:00:00', '2025-11-09 12:47:41', '2025-11-09 12:21:30', '2025-11-09 12:47:36', '2025-11-09 12:47:41', 0),
(3, 2, 'Fionah Irish', 'Beltran', 'soupcuppy@gmail.com', '$2b$10$l/lPrlJ8Vho/LyqoOiq2sOlSSrZ1t.atCEgMaxBBOW05jri/FfwIS', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2025-11-09 12:21:30', '2025-11-09 12:20:21', '2025-11-09 12:20:21', 0),
(5, 2, 'mark', 'mapili', 'markmapili72@gmail.com', '$2b$10$LMTrRhOAEKAweVGBy1NXQeGCWEzgN2d5WueonGDiRibvDGER08YVe', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2025-11-09 12:21:30', '2025-11-09 12:20:21', '2025-11-09 12:20:21', 0);

-- --------------------------------------------------------

--
-- Table structure for table `allergen_tbl`
--

CREATE TABLE `allergen_tbl` (
  `allergenID` int(11) NOT NULL,
  `allergenName` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `appointment_status_tbl`
--

CREATE TABLE `appointment_status_tbl` (
  `statusID` int(11) NOT NULL,
  `statusName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_status_tbl`
--

INSERT INTO `appointment_status_tbl` (`statusID`, `statusName`) VALUES
(1, 'Pending'),
(2, 'Confirmed'),
(3, 'On Hold'),
(4, 'Cancelled'),
(5, 'No Show'),
(6, 'Completed');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_tbl`
--

CREATE TABLE `appointment_tbl` (
  `appointmentID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `petID` int(11) NOT NULL,
  `service` varchar(255) NOT NULL,
  `appointmentDate` date NOT NULL,
  `startTime` time NOT NULL,
  `endTime` time NOT NULL,
  `statusID` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `breed_records_tbl`
--

CREATE TABLE `breed_records_tbl` (
  `recordID` int(11) NOT NULL,
  `breedID` int(11) NOT NULL,
  `image_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `breed_tbl`
--

CREATE TABLE `breed_tbl` (
  `breedID` int(11) NOT NULL,
  `breedName` varchar(255) NOT NULL,
  `species` enum('Feline','Canine') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `clientinfo_tbl`
--

CREATE TABLE `clientinfo_tbl` (
  `cliendInfoId` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `address` varchar(250) NOT NULL,
  `contactNo` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clientinfo_tbl`
--

INSERT INTO `clientinfo_tbl` (`cliendInfoId`, `accId`, `address`, `contactNo`) VALUES
(1, 2, '141-I 16th Avenue East Rembo', 321452142);

-- --------------------------------------------------------

--
-- Table structure for table `pet_allergies_tbl`
--

CREATE TABLE `pet_allergies_tbl` (
  `petID` int(11) NOT NULL,
  `allergenID` int(11) NOT NULL,
  `severity` enum('Mild','Modarate','Severe') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pet_tbl`
--

CREATE TABLE `pet_tbl` (
  `petID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `petName` varchar(255) NOT NULL,
  `breedID` int(11) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `weight_kg` decimal(5,2) NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_tbl`
--

CREATE TABLE `role_tbl` (
  `roleID` int(11) NOT NULL,
  `roleName` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `role_tbl`
--

INSERT INTO `role_tbl` (`roleID`, `roleName`) VALUES
(1, 'Client'),
(2, 'Administrator'),
(3, 'Veterinarian');

-- --------------------------------------------------------

--
-- Table structure for table `userpreference_tbl`
--

CREATE TABLE `userpreference_tbl` (
  `userprefID` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `appointmentReminders` tinyint(1) NOT NULL,
  `petHealthUpd` tinyint(1) NOT NULL,
  `promoEmail` tinyint(1) NOT NULL,
  `clinicAnnouncement` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `userpreference_tbl`
--

INSERT INTO `userpreference_tbl` (`userprefID`, `accId`, `appointmentReminders`, `petHealthUpd`, `promoEmail`, `clinicAnnouncement`) VALUES
(1, 2, 1, 0, 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `vet_table`
--

CREATE TABLE `vet_table` (
  `vetId` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `licenseNumber` int(50) NOT NULL,
  `specializationId` int(11) NOT NULL,
  `certificationId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_tbl`
--
ALTER TABLE `account_tbl`
  ADD PRIMARY KEY (`accId`),
  ADD KEY `roleID_account_fk` (`roleID`);

--
-- Indexes for table `allergen_tbl`
--
ALTER TABLE `allergen_tbl`
  ADD PRIMARY KEY (`allergenID`);

--
-- Indexes for table `appointment_status_tbl`
--
ALTER TABLE `appointment_status_tbl`
  ADD PRIMARY KEY (`statusID`);

--
-- Indexes for table `appointment_tbl`
--
ALTER TABLE `appointment_tbl`
  ADD PRIMARY KEY (`appointmentID`),
  ADD KEY `accID_appointment_fk` (`accID`),
  ADD KEY `petID_appointment_fk` (`petID`),
  ADD KEY `statudID_appointment_fk` (`statusID`);

--
-- Indexes for table `breed_records_tbl`
--
ALTER TABLE `breed_records_tbl`
  ADD PRIMARY KEY (`recordID`);

--
-- Indexes for table `breed_tbl`
--
ALTER TABLE `breed_tbl`
  ADD PRIMARY KEY (`breedID`);

--
-- Indexes for table `clientinfo_tbl`
--
ALTER TABLE `clientinfo_tbl`
  ADD PRIMARY KEY (`cliendInfoId`),
  ADD KEY `accIdClient` (`accId`);

--
-- Indexes for table `pet_allergies_tbl`
--
ALTER TABLE `pet_allergies_tbl`
  ADD PRIMARY KEY (`petID`,`allergenID`),
  ADD KEY `allergenID_pet_allergies_fk` (`allergenID`);

--
-- Indexes for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  ADD PRIMARY KEY (`petID`),
  ADD KEY `breedID_pet_fk` (`breedID`);

--
-- Indexes for table `role_tbl`
--
ALTER TABLE `role_tbl`
  ADD PRIMARY KEY (`roleID`);

--
-- Indexes for table `userpreference_tbl`
--
ALTER TABLE `userpreference_tbl`
  ADD PRIMARY KEY (`userprefID`),
  ADD KEY `accIdPreference` (`accId`);

--
-- Indexes for table `vet_table`
--
ALTER TABLE `vet_table`
  ADD PRIMARY KEY (`vetId`),
  ADD KEY `accIdVet` (`accId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_tbl`
--
ALTER TABLE `account_tbl`
  MODIFY `accId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `allergen_tbl`
--
ALTER TABLE `allergen_tbl`
  MODIFY `allergenID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `appointment_status_tbl`
--
ALTER TABLE `appointment_status_tbl`
  MODIFY `statusID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `appointment_tbl`
--
ALTER TABLE `appointment_tbl`
  MODIFY `appointmentID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `breed_records_tbl`
--
ALTER TABLE `breed_records_tbl`
  MODIFY `recordID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `breed_tbl`
--
ALTER TABLE `breed_tbl`
  MODIFY `breedID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `clientinfo_tbl`
--
ALTER TABLE `clientinfo_tbl`
  MODIFY `cliendInfoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  MODIFY `petID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role_tbl`
--
ALTER TABLE `role_tbl`
  MODIFY `roleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `userpreference_tbl`
--
ALTER TABLE `userpreference_tbl`
  MODIFY `userprefID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vet_table`
--
ALTER TABLE `vet_table`
  MODIFY `vetId` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_tbl`
--
ALTER TABLE `account_tbl`
  ADD CONSTRAINT `roleID_account_fk` FOREIGN KEY (`roleID`) REFERENCES `role_tbl` (`roleID`);

--
-- Constraints for table `appointment_tbl`
--
ALTER TABLE `appointment_tbl`
  ADD CONSTRAINT `accID_appointment_fk` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`),
  ADD CONSTRAINT `petID_appointment_fk` FOREIGN KEY (`petID`) REFERENCES `pet_tbl` (`petID`),
  ADD CONSTRAINT `statudID_appointment_fk` FOREIGN KEY (`statusID`) REFERENCES `appointment_status_tbl` (`statusID`);

--
-- Constraints for table `clientinfo_tbl`
--
ALTER TABLE `clientinfo_tbl`
  ADD CONSTRAINT `accIdClient` FOREIGN KEY (`accId`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pet_allergies_tbl`
--
ALTER TABLE `pet_allergies_tbl`
  ADD CONSTRAINT `allergenID_pet_allergies_fk` FOREIGN KEY (`allergenID`) REFERENCES `allergen_tbl` (`allergenID`),
  ADD CONSTRAINT `petID_pet_allergies_fk` FOREIGN KEY (`petID`) REFERENCES `pet_tbl` (`petID`);

--
-- Constraints for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  ADD CONSTRAINT `breedID_pet_fk` FOREIGN KEY (`breedID`) REFERENCES `breed_tbl` (`breedID`);

--
-- Constraints for table `userpreference_tbl`
--
ALTER TABLE `userpreference_tbl`
  ADD CONSTRAINT `accIdPreference` FOREIGN KEY (`accId`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vet_table`
--
ALTER TABLE `vet_table`
  ADD CONSTRAINT `accIdVet` FOREIGN KEY (`accId`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
