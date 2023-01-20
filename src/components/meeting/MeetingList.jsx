import { Col, Row } from 'antd';
import EmptyHolder from '../placeholders/EmptyHolder';
import MeetingCard from './MeetingCard';

const MeetingList = ({ meetings }) => {
  return (
    <>
      {meetings ? (
        <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
          {meetings.map((data) => {
            return (
              <Col key={data._id} span={8}>
                <MeetingCard data={data} />
              </Col>
            );
          })}
        </Row>
      ) : (
        <EmptyHolder title="Your meetings list is empty!" />
      )}
    </>
  );
};

export default MeetingList;