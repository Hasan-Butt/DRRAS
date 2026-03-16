Create Database DRAAS
Use DRAAS;

--- Represents an emergency event---
CREATE TABLE DISASTER(
	DisasterID INT IDENTITY(1,1) PRIMARY KEY,
	Title VARCHAR(200) NOT NULL,
	Type VARCHAR(50) NOT NULL,
	SeverityLevel INT NOT NULL
		CHECK (SeverityLevel Between 1 AND 5),
	StartDate DATETIME2 NOT NULL,
	EndDate DATETIME2 NOT NULL,
	Status VARCHAR(20) NOT NULL
		CHECK (Status IN ('Active', 'Contained', 'Resolved')),
	Description VARCHAR(MAX) NULL
);


--Update Disaster Rename column Description to 

---Location: Represent geographical areas---
CREATE TABLE LOCATION(
	LocationID INT IDENTITY(1,1) PRIMARY KEY,
	City VARCHAR(100) NOT NULL,
	Region VARCHAR (100) NOT NULL,
	Latitude DECIMAL(9,6) NOT NULL,
	Longitude DECIMAL(9,6) NOT NULL
);

---Disaster Location: Handles many-to-many relationships---
CREATE TABLE DISASTER_LOCATION(
	DisasterID INT NOT NULL,
	LocationID INT NOT NULL,
	PRIMARY KEY (DisasterID, LocationID),
	FOREIGN KEY (DisasterID) REFERENCES DISASTER(DisasterID)
	ON DELETE CASCADE,
	FOREIGN KEY (LocationID) REFERENCES LOCATION(LocationID)
	ON DELETE CASCADE
);

---Resource: Represents available assets---
CREATE TABLE Resource(
	ResourceID INT IDENTITY(1,1) PRIMARY KEY,
	ResourceName VARCHAR(150) NOT NULL,
	ResourceType VARCHAR(50) NOT NULL,
	TotalQuantity INT NOT NULL
		CHECK (TotalQuantity >= 0),
	AvailableQuantity INT NOT NULL
		CHECK (AvailableQuantity >= 0 ),
	Units VARCHAR(50) NOT NULL,
	CONSTRAINT CHK_Resource_Quantity 
        CHECK (AvailableQuantity <= TotalQuantity)
);

---ResponseTeam: Represents operational teams---
CREATE TABLE ResponseTeam(
	TeamID INT IDENTITY(1,1) PRIMARY KEY,
	TeamName VARCHAR(150) NOT NULL,
	Specialization VARCHAR(100) NOT NULL,
	ContactInfo VARCHAR(200) NOT NULL,
	AvailabilityStatus VARCHAR(20) NOT NULL
		CHECK (AvailabilityStatus IN ('Available', 'Deployed', 'Unavailable'))
);

---User: Represents system users with different roles---
CREATE TABLE [User](
	UserID INT IDENTITY(1,1) PRIMARY KEY,
	FullName VARCHAR(50) NOT NULL,
	Email VARCHAR(100) NOT NULL UNIQUE,
	PasswordHash VARCHAR(255) NOT NULL,
	Role VARCHAR(20) NOT NULL
		CHECK (Role IN ('Admin', 'Rescuer', 'Viewer')),
	CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

---ResourceRequest: Represents request for resources before they are approved and allocated---
CREATE TABLE ResourceRequest(
	RequestID INT IDENTITY(1,1) PRIMARY KEY,
	DisasterID INT NOT NULL,
	ResourceID INT NOT NULL,
	RequestByUserID INT NOT NULL,
	RequestedQuantity INT NOT NULL CHECK (RequestedQuantity > 0),
	RequestDate DATETIME2 NOT NULL DEFAULT GETDATE(),
	PriorityLevel VARCHAR(20) NOT NULL
		CHECK (PriorityLevel IN ('Low', 'Medium', 'High', 'Critical')),
	Status VARCHAR(20) NOT NULL
		CHECK (Status IN ('Pending', 'Approved', 'Denied', 'Fulfilled')),
	Remarks VARCHAR (500) NULL,
	FOREIGN KEY (DisasterID) REFERENCES DISASTER(DisasterID),
	FOREIGN KEY (ResourceID) REFERENCES Resource(ResourceID),
	FOREIGN KEY (RequestByUserID) REFERENCES [User](UserID)
);

---Allocation: Represents the allocation of resources to response teams based on approved requests---
CREATE TABLE Allocation(
	AllocationID INT IDENTITY(1,1) PRIMARY KEY,
	DisasterID INT NOT NULL,
	ResourceID INT NOT NULL,
	RequestID INT NOT NULL,
	TeamID INT NOT NULL,
	AllocatedQuantity INT NOT NULL CHECK (AllocatedQuantity > 0),
	AllocationDate DATETIME2 NOT NULL DEFAULT GETDATE(),
	Status VARCHAR(20) NOT NULL
		CHECK (Status IN ('Pending', 'Approved', 'Deployed', 'Completed')),
	FOREIGN KEY (DisasterID) REFERENCES DISASTER(DisasterID),
	FOREIGN KEY (RequestID) REFERENCES ResourceRequest(RequestID),
	FOREIGN KEY (TeamID) REFERENCES ResponseTeam(TeamID)
);

Select * from DISASTER;
Select * from LOCATION;
Select * from DISASTER_LOCATION;
Select * from Resource;
Select * from ResponseTeam;
Select * from [User];
Select * from ResourceRequest;
Select * from Allocation;

--============= Functionalities =============

-- 1. Disaster Management
-- 1.1 Add a new disaster event (INSERT
Insert Into DISASTER (Title, Type, SeverityLevel, StartDate, Status, Discription)
Values ('Lahore Earthquake', 'Earthquake', 4, GETDATE(), 'Active', 'Severe earthquake causing damage');

-- 1.2 Update disaster status (UPDATE + WHERE)
Update DISASTER
Set Status = 'Contained'
Where DisasterID = 2;

-- 1.3 Search disasters containing a keyword (LIKE)
SELECT *
FROM Disaster
WHERE Title LIKE '%Flood%';

-- 1.4 List active disasters ordered by severity (ORDER BY)
SELECT * FROM Disaster
WHERE Status = 'Active'
ORDER BY SeverityLevel DESC;

-- 2. Location and Disaster Mapping
-- 2.1 Link a disaster to a location (INSERT)
Insert Into DISASTER_LOCATION (DisasterID, LocationID)
Values (2, 3);
Insert Into DISASTER_LOCATION (DisasterID, LocationID)
Values (3, 3);

-- 2.2 View disasters with their locations (JOIN)
SELECT D.Title, L.City, L.Region
FROM Disaster D
JOIN Disaster_Location DL ON D.DisasterID = DL.DisasterID
JOIN Location L ON DL.LocationID = L.LocationID;

-- 2.3 See disaster even if it has no location assigned (LEFT JOIN)
SELECT D.Title, L.City
FROM Disaster D
LEFT JOIN Disaster_Location DL ON D.DisasterID = DL.DisasterID
LEFT JOIN Location L ON DL.LocationID = L.LocationID;

-- 3. Resource & Inventory Management
-- 3.1 Add a new resource (INSERT)
Insert Into Resource (ResourceName, ResourceType, TotalQuantity, AvailableQuantity, Units)
Values ('Rescue Vehicles', 'Vehicle', 50, 50, 'Vehicles');

-- 3.2 Update resource quantity after new shipment (UPDATE)
Update Resource
Set TotalQuantity = TotalQuantity + 20, AvailableQuantity = AvailableQuantity + 20
Where ResourceID = 1;
select * from Resource;

-- 3.3 Find resources below critical stock level (WHERE)
Select * from Resource
Where AvailableQuantity < 60;

-- 3.4 Sort resources by availability (ORDER BY)
SELECT ResourceName, AvailableQuantity
FROM Resource
ORDER BY AvailableQuantity ASC;

-- 4. Resource Request Workflow
-- 4.1 Create a new resource request (INSERT)
Insert Into ResourceRequest (DisasterID, ResourceID, RequestByUserID, RequestedQuantity, PriorityLevel, Status)
Values (4, 3, 3, 5, 'Low', 'Pending');

-- 4.2 Approve a resource request (UPDATE)
UPDATE ResourceRequest
SET Status = 'Approved'
WHERE RequestID = 7;

-- 4.3 View pending requests for a disaster (WHERE)
SELECT * from ResourceRequest
WHERE DisasterID = 4 AND Status = 'Pending';

-- 4.4 List requests by priority (ORDER BY)
SELECT PriorityLevel, COUNT(*) AS TotalRequests
FROM ResourceRequest
GROUP BY PriorityLevel;

-- 4.5 Location having 2 or more Requests (GROUP BY + HAVING)
SELECT L.City, COUNT(*) AS TotalRequests
FROM ResourceRequest RR
JOIN Disaster_Location DL ON RR.DisasterID = DL.DisasterID
JOIN Location L ON DL.LocationID = L.LocationID
GROUP BY L.City
HAVING COUNT(*) >=  2;

-- 5. Allocation Management
-- 5.1 Allocate resources to disaster (INSERT)
Insert Into Allocation (DisasterID, ResourceID, RequestID, TeamID, AllocatedQuantity, Status)
Values (3, 2, 8, 1, 35, 'Approved');
Insert Into Allocation (DisasterID, ResourceID, RequestID, TeamID, AllocatedQuantity, Status)
Values (4, 3, 9, 2, 5, 'Approved');

-- 5.2 Update allocation status (UPDATE)
UPDATE Allocation
SET Status = 'Deployed'
WHERE AllocationID = 2;

-- 5.3 Show Allocation Dashboard details with disaster, resource, and team information (JOIN)
SELECT D.Title, R.ResourceName, T.TeamName, A.AllocatedQuantity
FROM Allocation A
JOIN Disaster D ON A.DisasterID = D.DisasterID
JOIN Resource R ON A.ResourceID = R.ResourceID
JOIN ResponseTeam T ON A.TeamID = T.TeamID;

-- 5.4 Find disasters without allocations (LEFT JOIN)
SELECT D.Title
FROM Disaster D
LEFT JOIN Allocation A ON D.DisasterID = A.DisasterID
WHERE A.AllocationID IS NULL;

-- 6. Team Operations
-- 6.1 Register response team (INSERT)
Insert Into ResponseTeam (TeamName, Specialization, ContactInfo, AvailabilityStatus)
Values ('Team Alpha', 'Medical', '03001234567', 'Available');
Insert Into ResponseTeam (TeamName, Specialization, ContactInfo, AvailabilityStatus)
Values ('Team Bravo', 'Search and Rescue', '03007654321', 'Available');

-- 6.2 Find available teams (WHERE)
Select * from ResponseTeam
Where AvailabilityStatus = 'Available';

-- 7. Analytical Queries (Aggregates)
-- 7.1 Total resources allocated per disaster (SUM + GROUP BY)
SELECT D.Title, SUM(A.AllocatedQuantity) AS TotalAllocated
FROM Allocation A
JOIN Disaster D ON A.DisasterID = D.DisasterID
GROUP BY D.Title;

--7.2 Average resource request size (AVG)
SELECT AVG(RequestedQuantity) AS AvgRequest
FROM ResourceRequest;

-- 7.3 Maximum Severity Disaster (MAX)
SELECT MAX(SeverityLevel) AS MaxSeverity
FROM Disaster;

-- 8. Subqueries
-- 8.1 Find disasters with highest severity
SELECT D.Title, D.SeverityLevel
FROM Disaster D
Where D.SeverityLevel = (SELECT MAX(SeverityLevel) FROM Disaster);

-- 8.2 Resources below average availability
SELECT *
FROM Resource
WHERE AvailableQuantity < (
    SELECT AVG(AvailableQuantity)
    FROM Resource
);

-- 9. Set Operations
-- 9.1 Combine disaster titles and resource names (UNION)
SELECT Title AS Name FROM Disaster
UNION
SELECT ResourceName FROM Resource;

-- 9.2 Resources requested AND allocated (INTERSECT)
SELECT ResourceID FROM ResourceRequest
INTERSECT
SELECT ResourceID FROM Allocation;

-- 9.3 Requested but not allocated resources (EXCEPT)
SELECT RequestID FROM ResourceRequest
EXCEPT
SELECT RequestID FROM Allocation;

-- 10. Full System Overview Queries
-- 10.1 Comprehensive disaster report with locations, resources, and teams (JOIN)
SELECT D.Title, L.City, R.ResourceName, T.TeamName
FROM Disaster D
JOIN Disaster_Location DL ON D.DisasterID = DL.DisasterID
JOIN Location L ON DL.LocationID = L.LocationID
JOIN Allocation A ON D.DisasterID = A.DisasterID
JOIN Resource R ON A.ResourceID = R.ResourceID
JOIN ResponseTeam T ON A.TeamID = T.TeamID;

-- 10.2 Disasters with no resource allocations (FULL OUTER JOIN)
SELECT D.Title, A.AllocationID
FROM Disaster D
FULL OUTER JOIN Allocation A
ON D.DisasterID = A.DisasterID;

-- 10.3 All Teams including those not assigned (RIGHT JOIN)
SELECT T.TeamName, A.AllocationID
FROM Allocation A
RIGHT JOIN ResponseTeam T
ON A.TeamID = T.TeamID;
