-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 03, 2025 at 09:03 AM
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
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `account_tbl`
--

INSERT INTO `account_tbl` (`accId`, `roleID`, `firstName`, `lastName`, `eMail`, `password`, `createdAt`, `lastUpdatedAt`, `isDeleted`) VALUES
(2, 1, 'Mark', 'Mapili', 'markmapili29@gmail.com', '$2b$10$BQZcuX9rPNcSwTmwmaIaE.lw/uT7.lQXIevkgG9f1pBY8fIpEZX0K', '0000-00-00 00:00:00', '0000-00-00 00:00:00', 0);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
