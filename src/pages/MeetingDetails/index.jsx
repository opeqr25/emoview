import { Modal, Spin, Tabs } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  getMeetingByEmoviewCode,
  getMeetingParticipants,
  removeMeeting,
  setMeetingStatus,
  startRecognition,
  stopRecognition,
} from '../../api/meeting.js';
import { getRecognition } from '../../api/recognition.js';
import PageLayout from '../../components/layout/PageLayout.jsx';
import Header from '../../components/meetingDetails/Header.jsx';
import ParticipantList from '../../components/meetingDetails/ParticipantList.jsx';
import Recognition from '../../components/meetingDetails/Recognition.jsx';
import EmptyHolder from '../../components/placeholders/EmptyHolder.jsx';

const { confirm } = Modal;

const MeetingDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [meetingData, setMeetingData] = useState();
  const [recognitionStatus, setRecognitionStatus] = useState();
  const [recognitionsDetail, setRecognitionsDetail] = useState();
  const [recognitionsOverview, setRecognitionsOverview] = useState({});
  const [recognitionsSummary, setRecognitionsSummary] = useState();
  const [meetingParticipants, setMeetingParticipants] = useState([]);

  const [isLoadingStart, setIsLoadingStart] = useState(false);
  const [isLoadingEnd, setIsLoadingEnd] = useState(false);

  const [accessToken, setAccessToken] = useState();

  const { meetCode, emoviewCode } = useParams();
  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BE_ENDPOINT;
  const socket = io(baseURL, { transports: ['websocket'], upgrade: false });

  const handleOnMount = async () => {
    try {
      setIsLoading(true);
      const data = await getMeetingByEmoviewCode({ emoviewCode });
      setMeetingData(data[0]);
      fetchRecognitionOverview(emoviewCode, ' ');
      fetchMeetingParticipants(emoviewCode);
      setIsLoading(false);

      socket.on('connect', () => {
        socket.emit('join', emoviewCode);
      });

      socket.on('USER_JOINED', () => {
        fetchMeetingParticipants(emoviewCode);
      });

      socket.on('RECOGNITION_DATA_ADDED', () => {
        fetchRecognitionOverview(emoviewCode, ' ');
        console.log('FER:: Recognition Running');
      });
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMeetingById = async () => {
    try {
      const data = await getMeetingByEmoviewCode({ emoviewCode });
      setMeetingData(data[0]);
      await fetchRecognitionOverview(emoviewCode, ' ');
      await fetchMeetingParticipants(emoviewCode);
    } catch (error) {
      console.log(error);
    }
  };

  const getAccessToken = async () => {
    const accessToken = await window.electronAPI.getAccessToken();
    setAccessToken(accessToken);
  };

  const openInMeeting = async () => {
    await window.electronAPI.openFloating(emoviewCode, accessToken);
  };

  const handleStartMeeting = async () => {
    setIsLoadingStart(true);
    await setMeetingStatus({
      emoviewCode,
      statusStart: true,
      statusEnd: false,
    });
    await fetchMeetingById();
  };

  const handleStopMeeting = async () => {
    confirm({
      title: 'Do you want to end this meeting?',
      content: (
        <span>
          Warning : You <strong>cannot</strong> change this later!
        </span>
      ),
      okText: 'End',
      okType: 'danger',
      okButtonProps: { type: 'primary' },
      cancelButtonProps: { type: 'text' },
      onOk: async () => {
        await setMeetingStatus({
          emoviewCode,
          statusStart: true,
          statusEnd: true,
        });
        fetchMeetingById();
      },
    });

    setIsLoadingEnd(false);
  };

  const handleStartRecognition = async () => {
    await startRecognition(emoviewCode);
    handleOnMount();
  };

  const handleStopRecognition = async () => {
    await stopRecognition(emoviewCode);
    fetchMeetingById();
  };

  const handleDeleteMeeting = () => {
    confirm({
      title: 'Do you want to delete this meeting?',
      content: (
        <span>
          Warning : You <strong>cannot</strong> change this later!
        </span>
      ),
      okText: 'Delete',
      okType: 'danger',
      okButtonProps: { type: 'primary' },
      cancelButtonProps: { type: 'text' },
      onOk: async () => {
        await removeMeeting({ emoviewCode });
        navigate(`/classes/${meetCode}`);
      },
    });
  };

  const handleSwitch = (checked) => {
    if (checked) {
      handleStartRecognition();
      localStorage.setItem(
        `classes/${meetCode}/${emoviewCode}/started`,
        checked
      );
    } else {
      handleStopRecognition();
      localStorage.removeItem(`classes/${meetCode}/${emoviewCode}/started`);
    }
  };

  const getSwitchStatus = () => {
    const status = localStorage.getItem(
      `classes/${meetCode}/${emoviewCode}/started`
    );
    if (status === null) {
      setRecognitionStatus(false);
    } else {
      setRecognitionStatus(true);
    }
  };

  const fetchRecognitionOverview = async (emoviewCode, limit) => {
    try {
      const data = await getRecognition(emoviewCode, limit);
      setRecognitionsDetail(data.recognitionsDetail);
      setRecognitionsOverview(data.recognitionsOverview);
      setRecognitionsSummary(data.recognitionsSummary);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMeetingParticipants = async (emoviewCode) => {
    try {
      const data = await getMeetingParticipants({ emoviewCode });
      setMeetingParticipants(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleOnMount();
    getSwitchStatus();
    getAccessToken();

    return function cleanup() {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      {meetingData && (
        <PageLayout backToPrevious prevLink={`classes/${meetCode}`}>
          <Header
            name={meetingData.name}
            subject={meetingData.subject}
            description={meetingData.description}
            link={meetingData.link}
            emoviewCode={meetingData.emoviewCode}
            isStart={meetingData.isStart}
            isEnded={meetingData.isEnded}
            recognitionStatus={recognitionStatus}
            handleStartMeeting={handleStartMeeting}
            handleStopMeeting={handleStopMeeting}
            handleDeleteMeeting={handleDeleteMeeting}
            handleSwitch={handleSwitch}
            openInMeeting={openInMeeting}
            fetchMeetingById={fetchMeetingById}
            meetingData={meetingData}
            isLoadingStart={isLoadingStart}
            isLoadingEnd={isLoadingEnd}
          />
          {meetingData.isStart ? (
            <Tabs
              className="mt-2"
              defaultActiveKey="1"
              tabBarStyle={{ borderBottom: '0px' }}
              items={[
                {
                  label: `Recognition`,
                  key: 'recognition',
                  children: (
                    <Recognition
                      recogDetail={recognitionsDetail}
                      recogOverview={recognitionsOverview}
                      recogSummary={recognitionsSummary}
                      withImage={false}
                    />
                  ),
                },
                {
                  label: `Participants`,
                  key: 'participants',
                  children: (
                    <ParticipantList
                      currentMenu={`classes/${meetCode}`}
                      pageId={emoviewCode}
                      meetingParticipants={meetingParticipants}
                    />
                  ),
                },
              ]}
            />
          ) : isLoading ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                textAlign: 'center',
              }}
            >
              <Spin />
            </div>
          ) : (
            <EmptyHolder title="Start meeting & recognition to see emotion data!" />
          )}
        </PageLayout>
      )}
    </>
  );
};

export default MeetingDetails;
