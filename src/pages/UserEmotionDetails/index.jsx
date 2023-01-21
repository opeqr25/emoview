import { Breadcrumb, Tabs, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { FaAngleLeft } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMeetingById } from '../../api/meeting';
import { getRecognitionById } from '../../api/recognition';
import PageLayout from '../../components/layout/PageLayout';
import Recognition from '../../components/meetingDetails/Recognition';

const { Title } = Typography;

const UserEmotionDetails = () => {
  const [recognitionsDetail, setRecognitionsDetail] = useState();
  const [recognitionsOverview, setRecognitionsOverview] = useState({});
  const [recognitionsSummary, setRecognitionsSummary] = useState();

  const { meetingId, userId } = useParams();

  const navigate = useNavigate();

  const baseURL = import.meta.env.VITE_BE_ENDPOINT;
  const socket = io(baseURL);

  const fetchRecognitionById = async () => {
    try {
      const data = await getMeetingById(meetingId);
      fetchRecognitionOverview(data.code, userId, ' ');

      socket.on('connect', () => {
        socket.emit('join', `${data.code}-${userId}`);
      });

      if (data.isStart) {
        socket.on('RECOGNITION_DATA_ADDED', () => {
          fetchRecognitionOverview(data.code, userId, ' ');
          console.log('FER:: Recognition Running');
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchRecognitionOverview = async (id, userId, limit) => {
    try {
      const data = await getRecognitionById(id, userId, limit);
      setRecognitionsDetail(data.recognitionsDetail);
      setRecognitionsOverview(data.recognitionsOverview);
      setRecognitionsSummary(data.recognitionsSummary);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchRecognitionById();
  }, []);

  return (
    <PageLayout>
      <Breadcrumb style={{ marginBottom: '8px' }}>
        <Breadcrumb.Item>
          <Link
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center' }}
          >
            <FaAngleLeft /> Back to Previous
          </Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Title level={3}>User Details</Title>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            label: `Recognition`,
            key: 'recognition',
            children: (
              <Recognition
                recogDetail={recognitionsDetail}
                recogOverview={recognitionsOverview}
                recogSummary={recognitionsSummary}
              />
            ),
          },
        ]}
      />
    </PageLayout>
  );
};

export default UserEmotionDetails;
