SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;


CREATE TABLE IF NOT EXISTS `location` (
`ID` int(11) NOT NULL,
  `Source` varchar(100) COLLATE latin1_german1_ci NOT NULL,
  `Hint` varchar(100) COLLATE latin1_german1_ci NOT NULL,
  `Latitude` decimal(10,0) NOT NULL,
  `Longitude` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

CREATE TABLE IF NOT EXISTS `playround` (
`ID` int(11) NOT NULL,
  `UserID` int(11) NOT NULL,
  `StartDate` datetime NOT NULL,
  `Finished` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

CREATE TABLE IF NOT EXISTS `puzzle` (
`ID` int(11) NOT NULL,
  `PlayRoundID` int(11) NOT NULL,
  `LocationID` int(11) NOT NULL,
  `hintused` tinyint(1) NOT NULL,
  `done` tinyint(1) NOT NULL,
  `solved` tinyint(1) NOT NULL,
  `Enddate` datetime NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;

CREATE TABLE IF NOT EXISTS `user` (
`ID` int(11) NOT NULL,
  `Name` varchar(30) COLLATE latin1_german1_ci NOT NULL,
  `Password` varchar(30) COLLATE latin1_german1_ci NOT NULL,
  `CurrentToken` varchar(50) COLLATE latin1_german1_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_german1_ci;


ALTER TABLE `location`
 ADD PRIMARY KEY (`ID`);

ALTER TABLE `playround`
 ADD PRIMARY KEY (`ID`);

ALTER TABLE `puzzle`
 ADD PRIMARY KEY (`ID`);

ALTER TABLE `user`
 ADD PRIMARY KEY (`ID`);


ALTER TABLE `location`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `playround`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `puzzle`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
ALTER TABLE `user`
MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
