import { useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { PatientDataContext } from './patient_data_context';
import { HashRouter, NavLink, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

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
        setPatientData(results);
        navigate('/');
      },
    });
  };

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

  return <div>This is the homepage</div>;
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
