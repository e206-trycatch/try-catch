import { Link } from 'react-router-dom';

const LogOutMenu = () => (
  <>
    <Link to="/signup" className="hover:text-gray-300 font-medium">
      회원가입
    </Link>
    <Link to="/login" className="hover:text-gray-300 font-medium">
      로그인
    </Link>
  </>
);

export default LogOutMenu;
