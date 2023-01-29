import { Button, Dropdown, Typography } from 'antd';
import { FaEllipsisV } from 'react-icons/fa';
import { GrTextAlignFull } from 'react-icons/gr';
import Subtitle from '../common/typography/Subtitle';
import Title from '../common/typography/Title';
import UpdateMeeting from '../meeting/UpdateMeeting';
import RecognitionSwitch from './RecognitionSwitch';
import FloatingDisplayIcon from '../icons/FloatingDisplay';
import MeetIcon from '../icons/Meet';

const { Paragraph, Text } = Typography;

const Header = ({
  name,
  subject,
  description,
  link,
  isStart,
  isEnded,
  recognitionStatus,
  handleStartMeeting,
  handleStopMeeting,
  handleDeleteMeeting,
  handleSwitch,
  openInMeeting,
  fetchMeetingById,
  meetingData,
}) => {
  const items = [
    {
      key: '1',
      label: (
        <UpdateMeeting
          fetchData={fetchMeetingById}
          initialValues={meetingData}
        />
      ),
    },
    {
      key: '2',
      danger: true,
      label: <a onClick={() => handleDeleteMeeting()}>Delete Meeting</a>,
    },
  ];

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '8px',
          marginBottom: '8px',
        }}
      >
        <div className="mb-2">
          <Title>{name}</Title>
          <Subtitle>{subject}</Subtitle>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <RecognitionSwitch
              isStart={isStart}
              isEnded={isEnded}
              recognitionStatus={recognitionStatus}
              handleSwitch={handleSwitch}
            />
            {!isEnded && isStart && (
              <Button type="primary" onClick={() => openInMeeting()}>
                <div className="flex items-center space-x-1">
                  <FloatingDisplayIcon />
                  <span>Floating Display</span>
                </div>
              </Button>
            )}
            {!isEnded && !isStart && (
              <Button type="primary" onClick={() => handleStartMeeting()}>
                Start Meeting
              </Button>
            )}
            {!isEnded && isStart && (
              <Button
                danger
                type="primary"
                style={{ backgroundColor: '#B91C1C' }}
                onClick={() => handleStopMeeting()}
              >
                End Meeting
              </Button>
            )}
            <Dropdown
              menu={{
                items,
              }}
              placement="bottomRight"
              arrow
            >
              <Button type="text">
                <Subtitle>
                  <FaEllipsisV />
                </Subtitle>
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-2">
        <div className="flex items-center space-x-2">
          <GrTextAlignFull className="h-4 w-5" />
          <span>{description}</span>
        </div>
        <div className="flex items-center space-x-2">
          <MeetIcon />
          <a href={!isEnded && link} target="_blank">
            <Text copyable>{link}</Text>
          </a>
          {isEnded && <span> Ended</span>}
        </div>
      </div>
    </>
  );
};

export default Header;
