import { useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { PatientDataContext } from './patient_data_context';
import { HashRouter, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

// Info about how form fields should be parsed. Any fields not included here will be left as strings
const submission_info = {
  // UTC with date and time
  dateTime: ['Submission Date'],
  // For date-only strings, parsed as UTC midnight
  date: [],
  // Multiple choice questions will be parsed to an array
  multipleChoice: ['Multiple Choice Question'],
  int: ['Number Question'],
  float: [],
};

const Intake = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [, setPatientData] = useContext(PatientDataContext);
  const navigate = useNavigate();

  const handleFileSelected = (event) => {
    if (event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const parseFile = () => {
    Papa.parse(selectedFile, {
      header: true,
      complete: (results) => {
        console.log(results.data);
        const parsedData = parseData(results.data);
        console.log(parsedData);
        setPatientData(parsedData);
        navigate('/');
      },
    });
  };

  const parseData = (data) => {
    const parsedData = data.map((submission) => {
      const result = submission;
      submission_info.dateTime.map((field) => (result[field] = parseDateTime(result[field])));
      submission_info.date.map((field) => (result[field] = parseDate(result[field])));
      submission_info.multipleChoice.map((field) => (result[field] = result[field].split('\n')));
      submission_info.int.map((field) => (result[field] = parseInt(result[field])));
      submission_info.float.map((field) => (result[field] = parseFloat(result[field])));
      return result;
    });
    return parsedData;
  };

  // https://stackoverflow.com/questions/5619202/parsing-a-string-to-a-date-in-javascript
  const parseDateTime = (rawDateTimeString) => {
    const [dateString, timeString] = rawDateTimeString.split(' ');
    const paddedTimeString = timeString.length === 8 ? timeString : '0' + timeString;
    const preppedDateTimeString = dateString + 'T' + paddedTimeString + 'Z';
    console.log(preppedDateTimeString);
    return new Date(preppedDateTimeString);
  };

  const parseDate = (rawDateString) => rawDateString;

  return (
    <>
      <input type="file" onChange={handleFileSelected} />
      {selectedFile !== null && <button onClick={parseFile}>Go</button>}
    </>
  );
};

const Home = () => {
  const [patientData] = useContext(PatientDataContext);
  const navigate = useNavigate();

  console.log(patientData);

  useEffect(() => {
    if (!patientData || patientData.length === 0) {
      navigate('intake', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div>Welcome to the app!</div>
      <div>Yesterday's new patients:</div>
      {}
    </div>
  );
};

const links = [
  {
    text: 'Home',
    slug: '/',
  },
  {
    text: 'Load File',
    slug: '/intake',
  },
  {
    text: 'Patients',
    slug: '/patients',
  },
];

const Layout = () => {
  return (
    <>
      <div>
        {links.map((link, index) => (
          <NavLink
            key={index}
            to={link.slug}
            className={({ isActive }) => (isActive ? 'text-red-500' : 'text-green-500')}
          >
            {link.text}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </>
  );
};

function App() {
  const [patientData, setPatientData] = useState([]);

  return (
    <PatientDataContext.Provider value={[patientData, setPatientData]}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="intake" element={<Intake />} />
            {/* <Route path="patients" element={<Patients />} /> */}
            {/* <Route path="patients/:id" element={<Patient />} /> */}
          </Route>
        </Routes>
      </HashRouter>
    </PatientDataContext.Provider>
  );
}

export default App;
