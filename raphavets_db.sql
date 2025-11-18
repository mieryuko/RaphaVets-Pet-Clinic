-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 18, 2025 at 11:10 AM
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
(2, 3, 'Marke', 'Mapili', 'markmapili29@gmail.com', '$2b$10$NNG154DuvS/ST/lInE1Pp.XyhniL6YtSE.3UaiAv6/OvON5uMi3MC', '2025-11-19 19:01:01', '2025-11-18 15:36:36', '2025-11-09 12:21:30', '2025-11-18 15:36:36', '2025-11-09 19:26:09', 0),
(3, 2, 'Fionah Irish', 'Beltran', 'soupcuppy@gmail.com', '$2b$10$l/lPrlJ8Vho/LyqoOiq2sOlSSrZ1t.atCEgMaxBBOW05jri/FfwIS', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2025-11-09 12:21:30', '2025-11-09 12:20:21', '2025-11-09 12:20:21', 0),
(5, 2, 'mark', 'mapili', 'markmapili72@gmail.com', '$2b$10$LMTrRhOAEKAweVGBy1NXQeGCWEzgN2d5WueonGDiRibvDGER08YVe', '0000-00-00 00:00:00', '2025-11-18 13:18:51', '2025-11-09 12:21:30', '2025-11-18 13:18:51', '2025-11-09 12:20:21', 0),
(6, 1, 'Miguel', 'Rojero', 'miguelrojero@gmail.com', '0908@Taks', '2025-11-15 18:31:41', '2025-11-17 10:17:26', '2025-11-15 18:31:41', '2025-11-15 18:31:41', '2025-11-15 18:31:41', 1),
(8, 1, 'Vanerie', 'Parcon', 'vnaerie@gmail.com', '', '2025-11-16 00:09:49', '2025-11-16 14:50:13', '2025-11-16 00:09:49', '2025-11-16 00:09:49', '2025-11-16 00:09:49', 1),
(9, 1, 'Marvin', 'Tomales', 'marvin@gmail.com09123456789', '', '2025-11-16 00:15:22', '2025-11-16 00:15:22', '2025-11-16 00:15:22', '2025-11-16 00:15:22', '2025-11-16 00:15:22', 0),
(15, 1, 'Mark', 'Mapili', 'markmam@gmail.com', '$2b$10$HtvFEFf/H6rlr5R109DxCu5UXMYAcoVnnkCRZZckloDTavRFUmh62', '2025-11-16 13:46:52', '2025-11-16 13:46:52', '2025-11-16 13:46:52', '2025-11-16 13:46:52', '2025-11-16 13:46:52', 0),
(17, 1, 'Mark', 'Mapili', 'markmapili2004@gmail.com', '$2b$10$IdqYTFMGbjokXYO/KG8gq.HJ/zffX1yPKEUdl1nv21goERJPVb28e', '2025-11-18 09:28:29', '2025-11-18 09:33:18', '2025-11-18 09:28:29', '2025-11-18 09:33:18', '2025-11-18 09:28:29', 0);

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
  `serviceID` int(11) NOT NULL,
  `appointmentDate` date DEFAULT NULL,
  `scheduledTimeID` int(11) DEFAULT NULL,
  `visitDateTime` datetime DEFAULT NULL,
  `visitType` enum('Scheduled','Walk-in') NOT NULL,
  `statusID` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_tbl`
--

INSERT INTO `appointment_tbl` (`appointmentID`, `accID`, `petID`, `serviceID`, `appointmentDate`, `scheduledTimeID`, `visitDateTime`, `visitType`, `statusID`, `createdAt`, `lastUpdatedAt`, `isDeleted`) VALUES
(5, 2, 56, 2, '2025-11-22', 5, NULL, 'Scheduled', 1, '2025-11-16 15:19:32', '2025-11-18 18:08:44', 0);

-- --------------------------------------------------------

--
-- Table structure for table `breed_tbl`
--

CREATE TABLE `breed_tbl` (
  `breedID` int(11) NOT NULL,
  `breedName` varchar(255) NOT NULL,
  `species` enum('Cat','Dog') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `breed_tbl`
--

INSERT INTO `breed_tbl` (`breedID`, `breedName`, `species`) VALUES
(1, 'Persian', 'Cat'),
(2, 'Labrador', 'Dog');

-- --------------------------------------------------------

--
-- Table structure for table `clientinfo_tbl`
--

CREATE TABLE `clientinfo_tbl` (
  `cliendInfoId` int(11) NOT NULL,
  `accId` int(11) NOT NULL,
  `gender` enum('Male','Female') NOT NULL,
  `dateOfBIrth` date NOT NULL,
  `address` varchar(250) DEFAULT NULL,
  `contactNo` varchar(13) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clientinfo_tbl`
--

INSERT INTO `clientinfo_tbl` (`cliendInfoId`, `accId`, `gender`, `dateOfBIrth`, `address`, `contactNo`) VALUES
(1, 2, 'Male', '0000-00-00', '141-I 16th Avenue East Rembo', '09123456789'),
(2, 8, 'Female', '2025-11-08', NULL, '09888888888'),
(3, 9, 'Female', '0000-00-00', NULL, '09123456789'),
(9, 15, 'Male', '2025-11-12', NULL, '09123456789'),
(11, 17, 'Male', '2025-11-13', NULL, '09123456789');

-- --------------------------------------------------------

--
-- Table structure for table `forum_images_tbl`
--

CREATE TABLE `forum_images_tbl` (
  `forumImageID` int(11) NOT NULL,
  `forumID` int(11) NOT NULL,
  `imageName` varchar(255) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_images_tbl`
--

INSERT INTO `forum_images_tbl` (`forumImageID`, `forumID`, `imageName`, `isDeleted`) VALUES
(1, 2, 'image-1762858826305-982065420.jpg', 1),
(2, 2, 'image-1762858826306-797215708.jpg', 1),
(3, 3, 'image-1762858962364-675993991.jpeg', 1),
(4, 4, 'image-1762860491543-336551134.png', 1),
(5, 5, 'image-1762878564919-596408155.png', 1),
(6, 6, 'image-1762878779749-771930796.jpeg', 1),
(7, 7, 'image-1762878817463-839407871.png', 1),
(8, 8, 'image-1762878922606-295985859.png', 1),
(9, 9, 'image-1762880202374-527291952.jpeg', 1),
(10, 10, 'image-1762880881486-33113444.jpeg', 1),
(11, 11, 'image-1762881267978-109360591.jpeg', 1),
(12, 12, 'image-1762883343023-809445452.jpeg', 1),
(13, 13, 'image-1762888235903-34065093.png', 1),
(14, 13, 'image-1762890147093-869791497.png', 1),
(15, 14, 'image-1762890257174-434927200.png', 1),
(16, 14, 'image-1762890268841-638899812.jpeg', 1),
(17, 15, 'image-1762918604217-159052591.jpeg', 0),
(18, 15, 'image-1762920116768-235807608.png', 0),
(19, 15, 'image-1762920189690-705852010.png', 0),
(20, 16, 'image-1763126286418-934497497.jpg', 0);

-- --------------------------------------------------------

--
-- Table structure for table `forum_posts_tbl`
--

CREATE TABLE `forum_posts_tbl` (
  `forumID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `postType` enum('Found','Lost') NOT NULL,
  `description` varchar(255) NOT NULL,
  `contact` varchar(13) NOT NULL,
  `email` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isAnonymous` tinyint(1) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `forum_posts_tbl`
--

INSERT INTO `forum_posts_tbl` (`forumID`, `accID`, `postType`, `description`, `contact`, `email`, `createdAt`, `lastUpdatedAt`, `isAnonymous`, `isDeleted`) VALUES
(2, 2, 'Found', 'Hi Syug', '', 'cont@c.tin', '2025-11-11 19:00:26', '2025-11-12 00:46:46', 0, 1),
(3, 2, 'Found', 'Mark as Found Test 1', '', 'cont@c.tmo', '2025-11-11 19:02:42', '2025-11-12 00:53:41', 0, 1),
(4, 2, 'Found', 'Edit Timestamp check', '', 'timest@mp.check', '2025-11-11 19:28:11', '2025-11-12 00:53:51', 0, 1),
(5, 2, 'Found', 'sada', '', 'cont@c.tc', '2025-11-12 00:29:25', '2025-11-12 00:53:57', 0, 1),
(6, 2, 'Found', 'kupal', '09193344512', '', '2025-11-12 00:32:59', '2025-11-12 00:54:00', 0, 1),
(7, 2, 'Found', 'Hell Yeahh', '', 'cont@ct.me', '2025-11-12 00:33:37', '2025-11-12 00:56:52', 0, 1),
(8, 2, 'Lost', 'I am lost, trying to get found in an ocean of... People', '', 'cont@ct.me', '2025-11-12 00:35:22', '2025-11-12 00:56:58', 0, 1),
(9, 2, 'Found', 'tubol sa daan', '', 'cont@ct.me', '2025-11-12 00:56:42', '2025-11-12 01:05:01', 0, 1),
(10, 2, 'Lost', 'Ekis', '', 'cont@ct.me', '2025-11-12 01:08:01', '2025-11-12 01:14:36', 0, 1),
(11, 2, 'Lost', 'dikoalam', '', 'c@t.me', '2025-11-12 01:14:28', '2025-11-12 01:14:45', 0, 1),
(12, 2, 'Lost', 'Descriptive yarn', '', 'c@t.meow', '2025-11-12 01:49:03', '2025-11-12 01:49:15', 0, 1),
(13, 2, 'Lost', 'Louvre', '09021920987', 'contact@me.com', '2025-11-12 03:10:35', '2025-11-12 03:43:43', 1, 1),
(14, 2, 'Lost', 'Ihh ang bangis', '', 'cont@ct.me', '2025-11-12 03:44:17', '2025-11-12 11:35:31', 0, 1),
(15, 2, 'Lost', 'bin', '', 'cont@ct.me', '2025-11-12 11:36:44', '2025-11-12 12:03:09', 1, 0),
(16, 2, 'Lost', 'yes', '09123456789', 'markmapili28@gmail.com', '2025-11-14 21:18:06', '2025-11-14 21:18:32', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `icon_tbl`
--

CREATE TABLE `icon_tbl` (
  `iconID` int(11) NOT NULL,
  `icon` varchar(250) NOT NULL,
  `iconName` varchar(250) NOT NULL,
  `iconKey` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `icon_tbl`
--

INSERT INTO `icon_tbl` (`iconID`, `icon`, `iconName`, `iconKey`) VALUES
(1, 'scissors', 'Scissors', 'Scissors'),
(2, 'dumbbell', 'Exercise', 'Dumbbell'),
(3, 'droplets', 'Water', 'Droplets'),
(4, 'bone', 'Nutrition', 'Bone'),
(5, 'puzzle', 'Mental', 'Puzzle'),
(6, 'heart', 'Health', 'Heart'),
(7, 'stethoscope', 'Vet', 'Stethoscope'),
(8, 'utensils', 'Food', 'Utensils'),
(9, 'activity', 'Activity', 'Activity'),
(10, 'bath', 'Hygiene', 'Bath');

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
-- Table structure for table `pet_care_category_tbl`
--

CREATE TABLE `pet_care_category_tbl` (
  `petCareCategoryID` int(11) NOT NULL,
  `categoryName` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pet_care_category_tbl`
--

INSERT INTO `pet_care_category_tbl` (`petCareCategoryID`, `categoryName`) VALUES
(1, 'Health'),
(2, 'Nutrition'),
(3, 'Exercise'),
(4, 'Hygiene'),
(5, 'Behavior'),
(11, 'Hello');

-- --------------------------------------------------------

--
-- Table structure for table `pet_care_tips_content_tbl`
--

CREATE TABLE `pet_care_tips_content_tbl` (
  `petCareID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `iconID` int(11) NOT NULL,
  `title` varchar(250) NOT NULL,
  `petCareCategoryID` int(11) NOT NULL,
  `shortDescription` varchar(250) NOT NULL,
  `learnMoreURL` varchar(250) NOT NULL,
  `detailedContent` varchar(250) NOT NULL,
  `pubStatusID` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdated` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pet_care_tips_content_tbl`
--

INSERT INTO `pet_care_tips_content_tbl` (`petCareID`, `accID`, `iconID`, `title`, `petCareCategoryID`, `shortDescription`, `learnMoreURL`, `detailedContent`, `pubStatusID`, `createdAt`, `lastUpdated`, `isDeleted`) VALUES
(1, 5, 1, 'Brushed Your Dog’s Fur Daily', 4, 'Prevents mats and reduces shedding.', 'https://lila-loves-it.com/en/magazine/brushing-dogs-why-it-is-so-important/\r\n', 'Use a suitable brush to remove loose hair and prevent tangles. This keeps your dog comfortable, prevents skin irritation, and helps detect lumps or skin issues early.', 2, '2025-11-18 14:46:13', '2025-11-17 11:53:28', 0),
(2, 5, 1, 'Trim Your Cat’s Nails Weekly', 1, 'Avoids scratching injuries.', 'https://www.petmd.com/news/view/how-often-should-you-trim-cats-nails-37807', 'Use cat-specific nail clippers. Gently trim the sharp tips, avoid the quick, and reward your cat afterwards. Regular trimming keeps them safe and prevents furniture damage.', 2, '2025-11-18 14:46:13', '2025-11-18 15:35:02', 0),
(4, 5, 1, 'Give 30-Minute Walks Daily', 1, 'Keeps your dog healthy and active.', 'https://vcahospitals.com/know-your-pet/the-benefits-of-walking-your-dog', 'Walk your dog twice a day or a single 30-minute session. Walking supports physical fitness, reduces anxiety, and strengthens the bond with your pet.', 2, '2025-11-18 14:46:13', '2025-11-18 15:37:42', 0),
(5, 5, 3, 'Offer Fresh Water Multiple Times a Day', 1, 'Prevents dehydration.', 'https://www.wellnesspetfood.com/blog/how-often-should-you-change-your-pets-water/', 'Change your pet\'s water 2–3 times daily. Clean bowls thoroughly to avoid bacteria. Proper hydration keeps pets energetic and prevents kidney and urinary issues.', 1, '2025-11-18 14:46:13', '2025-11-17 13:04:10', 0),
(6, 5, 4, 'Feed Measured Portions', 2, 'Controls weight and digestion.', 'https://www.northpointpets.com/whyaccuratelymeasuringyourpetsfoodisessential/', 'Use a measuring cup to feed your pet appropriate portions based on age, size, and activity level. Avoid free-feeding. Consult your vet for dietary adjustments if needed.', 1, '2025-11-18 14:46:13', '2025-11-17 13:04:10', 0),
(7, 5, 1, 'Use Puzzle Toys to Stimulate Your Pet', 1, 'Keeps their mind sharp.', 'https://vmc.vet.osu.edu/sites/default/files/documents/behavioral-med-puzzle-toys-2024.pdf', 'Introduce treat puzzles, hide-and-seek games, or interactive toys. Mental stimulation prevents boredom, improves behavior, and strengthens your bond.', 1, '2025-11-18 14:46:13', '2025-11-18 15:34:12', 0),
(9, 2, 2, 'GAGi', 11, 'is it me your looking for', 'miss na miss kita', 'pinyabuhay sarap sustasya', 3, '2025-11-18 17:15:17', '2025-11-18 17:26:52', 0);

-- --------------------------------------------------------

--
-- Table structure for table `pet_tbl`
--

CREATE TABLE `pet_tbl` (
  `petID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `petName` varchar(255) NOT NULL,
  `petGender` enum('Male','Female') NOT NULL,
  `breedID` int(11) NOT NULL,
  `dateOfBirth` date NOT NULL,
  `weight_kg` decimal(5,2) DEFAULT NULL,
  `color` varchar(250) DEFAULT NULL,
  `note` varchar(250) DEFAULT NULL,
  `imageName` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pet_tbl`
--

INSERT INTO `pet_tbl` (`petID`, `accID`, `petName`, `petGender`, `breedID`, `dateOfBirth`, `weight_kg`, `color`, `note`, `imageName`, `createdAt`, `lastUpdatedAt`, `isDeleted`) VALUES
(53, 6, 'Carpenter', 'Female', 2, '2025-11-23', 1.00, 'dsada', 'dsadsa', '', '2025-11-15 23:53:43', '2025-11-16 14:50:36', 1),
(54, 15, 'HAHA', 'Male', 1, '2025-11-05', 2.00, 'das', NULL, '', '2025-11-16 13:46:52', '2025-11-16 13:46:52', 0),
(56, 2, 'Marcy', 'Male', 1, '2025-11-13', NULL, NULL, NULL, 'petImage-1763304525120-946292901.jpg', '2025-11-16 15:08:17', '2025-11-16 22:48:45', 0),
(57, 2, 'BEBE', 'Female', 1, '2025-11-05', 1.00, 'black', NULL, 'petImage-1763302372637-418073190.jpg', '2025-11-16 16:38:51', '2025-11-16 22:12:52', 0),
(59, 9, 'Tobi', 'Male', 1, '2025-11-04', 12.00, 'black', NULL, '', '2025-11-17 10:11:43', '2025-11-17 10:11:43', 0),
(60, 17, 'Markei', 'Male', 2, '2025-11-13', 12.00, 'Black', NULL, 'petImage-1763432387512-270847559.jpg', '2025-11-18 09:28:29', '2025-11-18 10:19:47', 0);

-- --------------------------------------------------------

--
-- Table structure for table `publication_status_tbl`
--

CREATE TABLE `publication_status_tbl` (
  `pubStatsID` int(11) NOT NULL,
  `pubStatus` varchar(250) NOT NULL,
  `pubStatusIcon` varchar(250) NOT NULL,
  `description` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `publication_status_tbl`
--

INSERT INTO `publication_status_tbl` (`pubStatsID`, `pubStatus`, `pubStatusIcon`, `description`) VALUES
(1, 'Draft', 'FileText', 'Save for later editing'),
(2, 'Published', 'Eye', 'Make visible to users'),
(3, 'Archived', 'Archive', 'Hide from users');

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
-- Table structure for table `scheduletime_tbl`
--

CREATE TABLE `scheduletime_tbl` (
  `scheduledTimeID` int(11) NOT NULL,
  `scheduleTime` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scheduletime_tbl`
--

INSERT INTO `scheduletime_tbl` (`scheduledTimeID`, `scheduleTime`) VALUES
(1, '08:00:00'),
(2, '09:00:00'),
(3, '10:00:00'),
(4, '11:00:00'),
(5, '12:00:00'),
(6, '13:00:00'),
(7, '14:00:00'),
(8, '15:00:00'),
(9, '16:00:00'),
(10, '17:00:00'),
(11, '18:00:00'),
(12, '19:00:00'),
(13, '20:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `service_pricing_tbl`
--

CREATE TABLE `service_pricing_tbl` (
  `priceID` int(11) NOT NULL,
  `serviceID` int(11) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `label` varchar(255) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_pricing_tbl`
--

INSERT INTO `service_pricing_tbl` (`priceID`, `serviceID`, `category`, `label`, `price`) VALUES
(1, 1, NULL, 'Consultation (Price may vary depending on type of service)', NULL),
(2, 6, 'For Dogs', '5-in-1 Vaccine', 500.00),
(3, 6, 'For Dogs', '8-in-1 Vaccine', 600.00),
(4, 6, 'For Dogs', 'Anti-Rabies Vaccine', 250.00),
(5, 6, 'For Dogs', 'Kennel Cough Vaccine', 500.00),
(6, 6, 'For Cats', '4-in-1 Vaccine', 850.00),
(7, 2, NULL, 'Surgery (Cost may vary depending on case)', NULL),
(8, 7, 'Price', 'Blood Chemistry Test', 2800.00),
(9, 3, 'Price', 'CBC Test', 950.00),
(10, 8, 'Price', 'Health Certificate', 750.00),
(11, 4, NULL, 'Microchipping (Price may vary depending on microchip type)', NULL),
(12, 9, NULL, 'Confinement (Depends on duration and care level)', NULL),
(13, 10, 'Prices', '1–10 kg', 5000.00),
(14, 10, 'Prices', '10.1–15 kg', 7000.00),
(15, 5, 'Prices', '0.1–2 kg', 150.00),
(16, 5, 'Prices', '2–5 kg', 250.00),
(17, 5, 'Prices', '5.1–7 kg', 300.00),
(18, 5, 'Prices', '7.1–10 kg', 350.00),
(19, 5, 'Prices', '10.1–15 kg', 400.00),
(20, 5, 'Prices', '15.1–20 kg', 450.00),
(21, 5, 'Prices', '20–30 kg', 500.00);

-- --------------------------------------------------------

--
-- Table structure for table `service_tbl`
--

CREATE TABLE `service_tbl` (
  `serviceID` int(11) NOT NULL,
  `service` varchar(250) NOT NULL,
  `description` varchar(250) NOT NULL,
  `long_description` text DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `duration` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `service_tbl`
--

INSERT INTO `service_tbl` (`serviceID`, `service`, `description`, `long_description`, `note`, `duration`) VALUES
(1, 'Consultation', 'General check-up', 'Our veterinary consultations provide expert guidance to ensure your pets stay healthy and well-cared for. From routine check-ups to addressing specific health concerns, our dedicated vets take the time to understand your pet\'s needs and offer tailored advice for their overall well-being.', 'Consultation fees may vary depending on the type of service required.', '30-50 min'),
(2, 'Basic Soft Tissue Surgery', 'Scheduled procedure', 'Our clinic provides safe and reliable soft tissue surgeries to address common health issues in pets, such as lump removals, wound repairs, or minor surgical needs. With modern facilities and experienced veterinarians, we ensure your pets receive gentle, expert care throughout the procedure.', 'Surgery costs may vary depending on the case and treatment required.', 'Varies'),
(3, 'CBC', 'Complete blood count', 'A complete blood count is an essential test to evaluate your pet\'s overall health. It helps detect infections, anemia, immune system issues, and other conditions that may not be visible through routine check-ups. Regular CBC testing ensures early detection and timely care for your pets.', NULL, 'Varies'),
(4, 'Microchipping', 'Permanent ID implant', 'Microchipping is a safe and permanent way to identify your pets and ensure they can always find their way back to you if lost. The tiny microchip is quickly implanted under your pet\'s skin and linked to your contact information, giving you peace of mind and added security for your beloved companion.', 'Pricing may vary depending on the type of microchip and registration requirements.', 'Varies'),
(5, 'Deworming', 'Parasite control', 'Protect your pets from harmful internal parasites with our safe and effective deworming service. Regular deworming ensures your dogs and cats stay healthy, active, and free from intestinal worms.', NULL, 'Varies'),
(6, 'Vaccination', 'Routine vaccines', 'Protect your pets from harmful diseases with our comprehensive vaccination services. We provide safe and effective vaccines tailored to your pet\'s needs, ensuring their long-term health and immunity.', NULL, 'Varies'),
(7, 'Blood Chemistry Lab', 'Detailed panel', 'Our blood chemistry tests provide vital insights into your pet\'s overall health, including organ function, hydration, and possible underlying conditions. This service helps us detect issues early and create the right treatment plan for your dog or cat.', NULL, 'Varies'),
(8, 'Veterinary Health Certificate', 'Travel & export docs', 'A veterinary health certificate provides official proof that your pet is healthy and fit for travel, adoption, or other requirements. Our licensed veterinarians will examine your dog or cat thoroughly to ensure they meet all health standards before issuing the certificate.', NULL, 'Varies'),
(9, 'Confinement', 'Overnight observation', 'For pets requiring close monitoring and extended care, our clinic offers safe and comfortable confinement facilities. Whether your pet is recovering from surgery, illness, or needs observation, our veterinary team ensures they receive round-the-clock attention and proper medical support.', 'Pricing depends on the duration of stay and the level of care required.', 'Varies'),
(10, 'Dental Prophylaxis', 'Cleaning & check', 'Good oral health is essential for your pet\'s overall well-being. Our dental prophylaxis service includes thorough cleaning to prevent plaque, tartar buildup, and gum disease, helping your pets maintain healthy teeth and fresh breath.', NULL, 'Varies');

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
(1, 2, 0, 0, 1, 0);

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

-- --------------------------------------------------------

--
-- Table structure for table `video_category_tbl`
--

CREATE TABLE `video_category_tbl` (
  `videoCategoryID` int(11) NOT NULL,
  `videoCategory` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video_category_tbl`
--

INSERT INTO `video_category_tbl` (`videoCategoryID`, `videoCategory`) VALUES
(1, 'Training'),
(2, 'Health Tips'),
(3, 'Grooming'),
(4, 'Behavior'),
(5, 'Nutrition');

-- --------------------------------------------------------

--
-- Table structure for table `video_content_tbl`
--

CREATE TABLE `video_content_tbl` (
  `videoID` int(11) NOT NULL,
  `accID` int(11) NOT NULL,
  `videoTitle` varchar(250) NOT NULL,
  `videoCategoryID` int(11) NOT NULL,
  `videoURL` varchar(250) NOT NULL,
  `pubStatusID` int(11) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `lastUpdated` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `video_content_tbl`
--

INSERT INTO `video_content_tbl` (`videoID`, `accID`, `videoTitle`, `videoCategoryID`, `videoURL`, `pubStatusID`, `createdAt`, `lastUpdated`, `isDeleted`) VALUES
(1, 5, 'Dog Training 101: How to Train ANY DOG the Basics', 1, 'https://www.youtube.com/watch?v=jFMA5ggFsXU', 1, '2025-11-18 14:45:15', '2025-11-17 13:20:19', 0),
(2, 5, 'How to Bathe your Cat that Hates Water (6 Step Tutorial) | The Cat Butler', 3, 'https://www.youtube.com/watch?v=ORtlZG_RU1s', 1, '2025-11-18 14:45:15', '2025-11-17 13:22:33', 0),
(3, 5, 'Top 10 Best Foods for Dogs!!', 4, 'https://www.youtube.com/watch?v=qwKMf_5pU_Y', 1, '2025-11-18 14:45:15', '2025-11-17 13:23:24', 0),
(4, 5, '10 Signs Your Cat is Sick And Needs Help (A Vet\'s Advice)', 2, 'https://www.youtube.com/watch?v=rR6aXt-bRGs', 1, '2025-11-18 14:45:15', '2025-11-17 13:23:24', 0),
(5, 5, 'How To Stop Your Dog Barking - You Can Do This Right Now', 5, 'https://www.youtube.com/watch?v=pZkzdsjtWc0', 1, '2025-11-18 14:45:15', '2025-11-17 13:25:26', 0),
(6, 5, 'How to Trim Dog Nails Safely', 3, 'https://www.youtube.com/watch?v=VnJafu_NMoQ', 2, '2025-11-18 14:45:15', '2025-11-17 13:25:26', 0),
(7, 5, 'Cat Nutrition: The Food, The Bad & The Ugly: Part 1: Dry Food!', 4, 'https://www.youtube.com/watch?v=6cvxA1CMbMQ', 1, '2025-11-18 14:45:15', '2025-11-17 13:25:26', 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account_tbl`
--
ALTER TABLE `account_tbl`
  ADD PRIMARY KEY (`accId`),
  ADD UNIQUE KEY `email` (`email`),
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
  ADD KEY `statudID_appointment_fk` (`statusID`),
  ADD KEY `serviceID_appointment_fk` (`serviceID`),
  ADD KEY `scheduledTimeID` (`scheduledTimeID`);

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
-- Indexes for table `forum_images_tbl`
--
ALTER TABLE `forum_images_tbl`
  ADD PRIMARY KEY (`forumImageID`),
  ADD KEY `forumID_forum_images_fk` (`forumID`);

--
-- Indexes for table `forum_posts_tbl`
--
ALTER TABLE `forum_posts_tbl`
  ADD PRIMARY KEY (`forumID`),
  ADD KEY `accID_forum_fk` (`accID`);

--
-- Indexes for table `icon_tbl`
--
ALTER TABLE `icon_tbl`
  ADD PRIMARY KEY (`iconID`);

--
-- Indexes for table `pet_allergies_tbl`
--
ALTER TABLE `pet_allergies_tbl`
  ADD PRIMARY KEY (`petID`,`allergenID`),
  ADD KEY `allergenID_pet_allergies_fk` (`allergenID`);

--
-- Indexes for table `pet_care_category_tbl`
--
ALTER TABLE `pet_care_category_tbl`
  ADD PRIMARY KEY (`petCareCategoryID`);

--
-- Indexes for table `pet_care_tips_content_tbl`
--
ALTER TABLE `pet_care_tips_content_tbl`
  ADD PRIMARY KEY (`petCareID`),
  ADD KEY `petContent_accID_FK` (`accID`),
  ADD KEY `iconID_FK` (`iconID`),
  ADD KEY `petCareCategoryID_FK` (`petCareCategoryID`),
  ADD KEY `pubStatusID_PetCareTipFK` (`pubStatusID`);

--
-- Indexes for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  ADD PRIMARY KEY (`petID`),
  ADD KEY `breedID_pet_fk` (`breedID`),
  ADD KEY `accID_pettbl` (`accID`);

--
-- Indexes for table `publication_status_tbl`
--
ALTER TABLE `publication_status_tbl`
  ADD PRIMARY KEY (`pubStatsID`);

--
-- Indexes for table `role_tbl`
--
ALTER TABLE `role_tbl`
  ADD PRIMARY KEY (`roleID`);

--
-- Indexes for table `scheduletime_tbl`
--
ALTER TABLE `scheduletime_tbl`
  ADD PRIMARY KEY (`scheduledTimeID`);

--
-- Indexes for table `service_pricing_tbl`
--
ALTER TABLE `service_pricing_tbl`
  ADD PRIMARY KEY (`priceID`),
  ADD KEY `serviceID` (`serviceID`);

--
-- Indexes for table `service_tbl`
--
ALTER TABLE `service_tbl`
  ADD PRIMARY KEY (`serviceID`);

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
-- Indexes for table `video_category_tbl`
--
ALTER TABLE `video_category_tbl`
  ADD PRIMARY KEY (`videoCategoryID`);

--
-- Indexes for table `video_content_tbl`
--
ALTER TABLE `video_content_tbl`
  ADD PRIMARY KEY (`videoID`),
  ADD KEY `accID_videoContentFK` (`accID`),
  ADD KEY `videoCategoryID_videoContentFK` (`videoCategoryID`),
  ADD KEY `pubStatusID_videoContentFK` (`pubStatusID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account_tbl`
--
ALTER TABLE `account_tbl`
  MODIFY `accId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
  MODIFY `appointmentID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `breed_tbl`
--
ALTER TABLE `breed_tbl`
  MODIFY `breedID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `clientinfo_tbl`
--
ALTER TABLE `clientinfo_tbl`
  MODIFY `cliendInfoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `forum_images_tbl`
--
ALTER TABLE `forum_images_tbl`
  MODIFY `forumImageID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `forum_posts_tbl`
--
ALTER TABLE `forum_posts_tbl`
  MODIFY `forumID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `icon_tbl`
--
ALTER TABLE `icon_tbl`
  MODIFY `iconID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `pet_care_category_tbl`
--
ALTER TABLE `pet_care_category_tbl`
  MODIFY `petCareCategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `pet_care_tips_content_tbl`
--
ALTER TABLE `pet_care_tips_content_tbl`
  MODIFY `petCareID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  MODIFY `petID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `publication_status_tbl`
--
ALTER TABLE `publication_status_tbl`
  MODIFY `pubStatsID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role_tbl`
--
ALTER TABLE `role_tbl`
  MODIFY `roleID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `scheduletime_tbl`
--
ALTER TABLE `scheduletime_tbl`
  MODIFY `scheduledTimeID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `service_pricing_tbl`
--
ALTER TABLE `service_pricing_tbl`
  MODIFY `priceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `service_tbl`
--
ALTER TABLE `service_tbl`
  MODIFY `serviceID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

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
-- AUTO_INCREMENT for table `video_category_tbl`
--
ALTER TABLE `video_category_tbl`
  MODIFY `videoCategoryID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `video_content_tbl`
--
ALTER TABLE `video_content_tbl`
  MODIFY `videoID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `accID_appointment_fk` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `petID_appointment_fk` FOREIGN KEY (`petID`) REFERENCES `pet_tbl` (`petID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `scheduledTimeID` FOREIGN KEY (`scheduledTimeID`) REFERENCES `scheduletime_tbl` (`scheduledTimeID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `serviceID_appointment_fk` FOREIGN KEY (`serviceID`) REFERENCES `service_tbl` (`serviceID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `statudID_appointment_fk` FOREIGN KEY (`statusID`) REFERENCES `appointment_status_tbl` (`statusID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clientinfo_tbl`
--
ALTER TABLE `clientinfo_tbl`
  ADD CONSTRAINT `accIdClient` FOREIGN KEY (`accId`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `forum_images_tbl`
--
ALTER TABLE `forum_images_tbl`
  ADD CONSTRAINT `forumID_forum_images_fk` FOREIGN KEY (`forumID`) REFERENCES `forum_posts_tbl` (`forumID`);

--
-- Constraints for table `forum_posts_tbl`
--
ALTER TABLE `forum_posts_tbl`
  ADD CONSTRAINT `accID_forum_fk` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`);

--
-- Constraints for table `pet_allergies_tbl`
--
ALTER TABLE `pet_allergies_tbl`
  ADD CONSTRAINT `allergenID_pet_allergies_fk` FOREIGN KEY (`allergenID`) REFERENCES `allergen_tbl` (`allergenID`),
  ADD CONSTRAINT `petID_pet_allergies_fk` FOREIGN KEY (`petID`) REFERENCES `pet_tbl` (`petID`);

--
-- Constraints for table `pet_care_tips_content_tbl`
--
ALTER TABLE `pet_care_tips_content_tbl`
  ADD CONSTRAINT `iconID_FK` FOREIGN KEY (`iconID`) REFERENCES `icon_tbl` (`iconID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `petCareCategoryID_FK` FOREIGN KEY (`petCareCategoryID`) REFERENCES `pet_care_category_tbl` (`petCareCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `petContent_accID_FK` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pubStatusID_PetCareTipFK` FOREIGN KEY (`pubStatusID`) REFERENCES `publication_status_tbl` (`pubStatsID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `pet_tbl`
--
ALTER TABLE `pet_tbl`
  ADD CONSTRAINT `accID_pettbl` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `breedID_pet_fk` FOREIGN KEY (`breedID`) REFERENCES `breed_tbl` (`breedID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `service_pricing_tbl`
--
ALTER TABLE `service_pricing_tbl`
  ADD CONSTRAINT `service_pricing_tbl_ibfk_1` FOREIGN KEY (`serviceID`) REFERENCES `service_tbl` (`serviceID`) ON DELETE CASCADE;

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

--
-- Constraints for table `video_content_tbl`
--
ALTER TABLE `video_content_tbl`
  ADD CONSTRAINT `accID_videoContentFK` FOREIGN KEY (`accID`) REFERENCES `account_tbl` (`accId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `pubStatusID_videoContentFK` FOREIGN KEY (`pubStatusID`) REFERENCES `publication_status_tbl` (`pubStatsID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `videoCategoryID_videoContentFK` FOREIGN KEY (`videoCategoryID`) REFERENCES `video_category_tbl` (`videoCategoryID`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
